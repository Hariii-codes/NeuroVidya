# backend/app/api/diagrams.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import json
import os

from app.core.deps import get_current_user, get_database, get_optional_user
from app.models.models import User, ConceptDiagram, Prisma

router = APIRouter()

# OpenAI API key (optional - for diagram generation)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# ============================================
# Schemas
# ============================================

class DiagramNode(BaseModel):
    id: str
    label: str
    type: str  # "concept", "detail", "example", "connection"
    position: Dict[str, float]  # {x, y}
    data: Optional[Dict] = None


class DiagramEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    type: str  # "relates_to", "is_a", "has", "leads_to"


class GenerateDiagramRequest(BaseModel):
    conceptName: str
    description: str
    complexity: str = "simple"  # simple, moderate, complex


class GenerateDiagramResponse(BaseModel):
    diagramId: str
    nodes: List[DiagramNode]
    edges: List[DiagramEdge]
    conceptName: str
    description: str


class DiagramListResponse(BaseModel):
    diagrams: List[Dict]


# ============================================
# Helper Functions
# ============================================

def extract_key_concepts(description: str) -> List[Dict]:
    """
    Extract key concepts from description.
    In production, use NLP/AI for this.
    """
    # Simple keyword extraction based on common phrases
    concepts = []
    words = description.split()

    # Look for capitalized words (potential concepts)
    for i, word in enumerate(words):
        if word[0].isupper() and len(word) > 3:
            concepts.append({
                "label": word.strip(".,!?;:"),
                "type": "concept"
            })

    # Look for common connectors
    connectors = ["because", "therefore", "however", "also", "then"]
    for connector in connectors:
        if connector in description.lower():
            concepts.append({
                "label": connector.capitalize(),
                "type": "connection"
            })

    return concepts[:5]  # Limit to 5 key concepts


def generate_node_layout(concept_count: int) -> List[Dict]:
    """Generate positions for nodes in a circular layout."""
    nodes = []
    import math

    for i in range(concept_count):
        angle = (2 * math.pi * i) / concept_count
        x = 300 + 150 * math.cos(angle)
        y = 200 + 150 * math.sin(angle)
        nodes.append({
            "x": round(x, 2),
            "y": round(y, 2)
        })

    return nodes


def generate_diagram_from_text(concept_name: str, description: str, complexity: str) -> tuple[List[Dict], List[Dict]]:
    """
    Generate a visual diagram from text description.

    Returns:
        tuple: (nodes, edges)
    """
    # Extract key concepts
    key_concepts = extract_key_concepts(description)

    # Create main concept node
    nodes = [{
        "id": "main",
        "label": concept_name,
        "type": "concept",
        "position": {"x": 300, "y": 200},
        "data": {"isMain": True}
    }]

    edges = []

    # Generate layout for related concepts
    layout_positions = generate_node_layout(len(key_concepts))

    # Add concept nodes
    for i, concept in enumerate(key_concepts):
        node_id = f"node_{i}"
        position = layout_positions[i] if i < len(layout_positions) else {"x": 300, "y": 200}

        nodes.append({
            "id": node_id,
            "label": concept["label"],
            "type": concept["type"],
            "position": position,
            "data": {"concept": concept["label"]}
        })

        # Create edge from main concept
        edge_type = "relates_to" if concept["type"] == "concept" else "connection"
        edges.append({
            "id": f"edge_main_{i}",
            "source": "main",
            "target": node_id,
            "label": "relates to" if concept["type"] == "concept" else "leads to",
            "type": edge_type
        })

    # For complex diagrams, add interconnections
    if complexity == "complex" and len(key_concepts) > 2:
        for i in range(min(len(key_concepts), 3)):
            for j in range(i + 1, min(len(key_concepts), i + 3)):
                edges.append({
                    "id": f"edge_{i}_{j}",
                    "source": f"node_{i}",
                    "target": f"node_{j}",
                    "label": "related",
                    "type": "relates_to"
                })

    return nodes, edges


def generate_ai_diagram(concept_name: str, description: str, complexity: str) -> tuple[List[Dict], List[Dict]]:
    """
    Generate diagram using AI (OpenAI API if available).

    Falls back to rule-based generation if API key not available.
    """
    if not OPENAI_API_KEY:
        return generate_diagram_from_text(concept_name, description, complexity)

    try:
        import openai

        client = openai.OpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""
        Generate a visual concept diagram for: {concept_name}

        Description: {description}

        Complexity level: {complexity}

        Return a JSON object with:
        - nodes: array of {{id, label, type, position: {{x, y}}, data}}
        - edges: array of {{id, source, target, label, type}}

        Node types: concept, detail, example, connection
        Edge types: relates_to, is_a, has, leads_to

        Use positions for a 600x400 canvas. Center main concept at 300,200.
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a visual concept diagram generator. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        result = json.loads(response.choices[0].message.content)
        return result.get("nodes", []), result.get("edges", [])

    except Exception as e:
        print(f"AI diagram generation failed: {e}")
        return generate_diagram_from_text(concept_name, description, complexity)


# ============================================
# API Endpoints
# ============================================

@router.post("/generate", response_model=GenerateDiagramResponse)
async def generate_diagram(
    data: GenerateDiagramRequest,
    current_user: User = Depends(get_optional_user),
    db: Prisma = Depends(get_database)
):
    """
    Generate a visual concept diagram from text description.
    """
    try:
        # Generate diagram
        nodes, edges = generate_ai_diagram(
            data.conceptName,
            data.description,
            data.complexity
        )

        # Save to database (only if authenticated)
        diagram_id = "temp"
        if current_user:
            diagram = ConceptDiagram(
                userId=current_user.id,
                conceptName=data.conceptName,
                description=data.description,
                nodes=json.dumps(nodes),
                edges=json.dumps(edges)
            )
            db.add(diagram)
            db.commit()
            db.refresh(diagram)
            diagram_id = diagram.id
        else:
            import uuid
            diagram_id = str(uuid.uuid4())

        return GenerateDiagramResponse(
            diagramId=diagram_id,
            nodes=[DiagramNode(**n) for n in nodes],
            edges=[DiagramEdge(**e) for e in edges],
            conceptName=data.conceptName,
            description=data.description
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=DiagramListResponse)
async def list_diagrams(
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get all diagrams created by the user.
    """
    diagrams = db.query(ConceptDiagram).filter(
        ConceptDiagram.userId == current_user.id
    ).order_by(ConceptDiagram.generatedAt.desc()).limit(20).all()

    return DiagramListResponse(
        diagrams=[
            {
                "id": d.id,
                "conceptName": d.conceptName,
                "description": d.description,
                "generatedAt": d.generatedAt.isoformat(),
                "createdAt": d.createdAt.isoformat()
            }
            for d in diagrams
        ]
    )


@router.get("/{diagram_id}")
async def get_diagram(
    diagram_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Get a specific diagram by ID.
    """
    diagram = db.query(ConceptDiagram).filter(
        ConceptDiagram.id == diagram_id,
        ConceptDiagram.userId == current_user.id
    ).first()

    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    return {
        "id": diagram.id,
        "conceptName": diagram.conceptName,
        "description": diagram.description,
        "nodes": json.loads(diagram.nodes),
        "edges": json.loads(diagram.edges),
        "generatedAt": diagram.generatedAt.isoformat()
    }


@router.delete("/{diagram_id}")
async def delete_diagram(
    diagram_id: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Delete a diagram.
    """
    diagram = db.query(ConceptDiagram).filter(
        ConceptDiagram.id == diagram_id,
        ConceptDiagram.userId == current_user.id
    ).first()

    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    db.delete(diagram)
    db.commit()

    return {"success": True}


@router.post("/from-text")
async def generate_from_textbook(
    text: str,
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Automatically generate diagrams from textbook text.
    Identifies key concepts and creates visual representations.
    """
    # Split text into sentences
    sentences = [s.strip() for s in text.split('.') if s.strip()]

    diagrams = []

    # Look for definition patterns (e.g., "X is...", "X refers to...")
    import re
    definition_pattern = r'([A-Z][a-zA-Z]+)\s+(?:is|refers to|means|can be defined as)\s+([^.]*)'

    for sentence in sentences[:5]:  # Limit to 5 concepts
        match = re.search(definition_pattern, sentence)
        if match:
            concept_name = match.group(1)
            description = match.group(2)

            # Generate diagram
            nodes, edges = generate_diagram_from_text(concept_name, description, "simple")

            diagram = ConceptDiagram(
                userId=current_user.id,
                conceptName=concept_name,
                description=description,
                nodes=json.dumps(nodes),
                edges=json.dumps(edges)
            )
            db.add(diagram)
            db.commit()
            db.refresh(diagram)

            diagrams.append({
                "id": diagram.id,
                "conceptName": concept_name,
                "description": description,
                "nodes": nodes,
                "edges": edges
            })

    return {
        "diagrams": diagrams,
        "count": len(diagrams)
    }


@router.get("/export/{diagram_id}")
async def export_diagram(
    diagram_id: str,
    format: str = "json",  # json, png, svg
    current_user: User = Depends(get_current_user),
    db: Prisma = Depends(get_database)
):
    """
    Export diagram in various formats.
    """
    diagram = db.query(ConceptDiagram).filter(
        ConceptDiagram.id == diagram_id,
        ConceptDiagram.userId == current_user.id
    ).first()

    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    nodes = json.loads(diagram.nodes)
    edges = json.loads(diagram.edges)

    if format == "json":
        return {
            "conceptName": diagram.conceptName,
            "description": diagram.description,
            "nodes": nodes,
            "edges": edges
        }

    elif format == "svg":
        # Generate SVG
        svg_content = f'''<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#666"/>
                </marker>
            </defs>
            <style>
                .node {{ fill: #4CAF50; stroke: #2E7D32; stroke-width: 2; }}
                .node-label {{ font-family: Arial, sans-serif; font-size: 12px; fill: white; text-anchor: middle; }}
                .edge {{ stroke: #666; stroke-width: 2; marker-end: url(#arrowhead); }}
            </style>
        '''

        # Add edges
        for edge in edges:
            source_node = next((n for n in nodes if n["id"] == edge["source"]), None)
            target_node = next((n for n in nodes if n["id"] == edge["target"]), None)
            if source_node and target_node:
                svg_content += f'<line class="edge" x1="{source_node["position"]["x"]}" y1="{source_node["position"]["y"]}" x2="{target_node["position"]["x"]}" y2="{target_node["position"]["y"]}"/>'

        # Add nodes
        for node in nodes:
            x, y = node["position"]["x"], node["position"]["y"]
            svg_content += f'<circle class="node" cx="{x}" cy="{y}" r="30"/>'
            svg_content += f'<text class="node-label" x="{x}" y="{y + 4}">{node["label"][:10]}</text>'

        svg_content += "</svg>"

        return {"svg": svg_content}

    else:
        raise HTTPException(status_code=400, detail="Unsupported format")
