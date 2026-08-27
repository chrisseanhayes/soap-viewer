import xml.etree.ElementTree as ET
import glob
import re

def generate_mermaid_code(project_name, nav_seq):
    # Pre-defined app-level styles
    class_defs = {
        "osiLayer": "fill:#f3f4f6,stroke:#94a3b8,stroke-width:2px,stroke-dasharray:5 5",
        "process": "fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px",
        "clickable": "cursor:pointer,transition:all 0.2s",
        "soapResponse": "fill:#f0fdf4,stroke:#16a34a,stroke-width:2px",
        "soapLayer": "fill:#fef3c7,stroke:#d97706,stroke-width:2px"
    }
    
    node_type_icons = {
        "LibraryCode": "📚",
        "ApplicationCode": "🧑‍💻",
        "Serialization": "📄",
        "OSHardwareCode": "⚙️",
        "Compute": "💻",
        "Network": "☁️"
    }
    
    diagram_nodes = []
    
    edges_out = []
    click_handlers = []


    def get_full_text(element):
        if element is None: return ""
        text = element.text or ""
        for child in element:
            text += get_full_text(child)
            text += child.tail or ""
        return text.strip()

    def escape_label_edge(label):
        if not label: return ""
        return f"{label}"

    def escape_label_node(label):
        if not label: return ""
        return f"{label}"

    def parse_node(xml_node, depth=0):
        node_id = xml_node.get("id")
        label = xml_node.get("label")
        diagram_class = xml_node.get("diagramClass")
        node_type = xml_node.get("nodeType")
        
        diagram = xml_node.find("diagram")
        indent = "  " * depth
        out = ""
        
        if diagram is not None:
            # LEAF NODE
            leaf_label = get_full_text(diagram.find("nodeLabel")) or ""
            leaf_id = node_id # We just use the node_id directly now since we removed <nodeId>
            
            # Inject Step Number
            if leaf_id in nav_seq:
                diagram_nodes.append(leaf_id)
            
            is_clickable = False
            classes_tags = diagram.findall("classes/class")
            for c in classes_tags:
                c_name = c.get("name")
                if c_name == "clickable":
                    is_clickable = True
                c_style = c.get("style")
                if c_style:
                    c_style = c_style.replace(";", ",")
                    if c_style.endswith(","): c_style = c_style[:-1]
                    class_defs[c_name] = c_style
                click_handlers.append(f"class {leaf_id} {c_name}")
                
            # Inject emoji and number
            if node_type in node_type_icons:
                leaf_label = f"{node_type_icons[node_type]} {leaf_label}"
                
            # The step number will be computed at the end and string replaced. 
            # We'll use a placeholder for now.
            leaf_label = f"__STEP_{leaf_id}__ {leaf_label}"
                
            out += f"{indent}{leaf_id}[{escape_label_node(leaf_label)}]\n"
            
            if is_clickable:
                clean_label = re.sub(r'^.*?__STEP_[^ ]+__\s*', '', leaf_label)
                clean_label = re.sub(r'^(' + '|'.join(node_type_icons.values()) + r'|\s)+', '', clean_label).strip()
                if not clean_label:
                    clean_label = leaf_label
                click_handlers.append(f'click {leaf_id} call showDetails() "Details on {clean_label}"')
                
            for edges_dir in diagram.findall("edges"):
                if edges_dir.get("direction") == "out":
                    for edge in edges_dir.findall("edge"):
                        to = edge.get("to")
                        e_label = edge.get("label") or ""
                        e_type = edge.get("type")
                        
                        # Add emojis based on definition pills
                        pills = edge.findall("definitionPills/definitionPill")
                        icons = [node_type_icons[p.get("id")] for p in pills if p.get("id") in node_type_icons]
                        if icons:
                            e_label = f"{' '.join(icons)} {e_label}"
                        
                        arrow = "-->"
                        if e_type == "solid-line": arrow = "---"
                        elif e_type == "dotted-arrow": arrow = "-.->"
                        elif e_type == "dotted-line": arrow = "-.-"
                        
                        label_str = f"|{escape_label_edge(e_label)}|" if e_label else ""
                        edges_out.append(f"{leaf_id} {arrow}{label_str} {to}")
                        
        else:
            # SUBGRAPH CONTAINER
            children = xml_node.findall("node")
            if children:
                container_label = label
                if node_type in node_type_icons:
                    container_label = f"{node_type_icons[node_type]} {container_label}"
                    
                out += f"{indent}subgraph {node_id} [{escape_label_node(container_label)}]\n"
                if diagram_class:
                    click_handlers.append(f"class {node_id} {diagram_class}")
                    
                for child in children:
                    out += parse_node(child, depth + 1)
                out += f"{indent}end\n"
                
        return out

    mermaid_code = "graph TD\n"
    for f in glob.glob(f"../data/{project_name}/nodes/*.xml"):
        tree = ET.parse(f)
        mermaid_code += parse_node(tree.getroot(), 0) + "\n"

    for c_name, c_style in class_defs.items():
        if c_style: mermaid_code += f"classDef {c_name} {c_style}\n"

    mermaid_code += "\n"
    for e in edges_out: mermaid_code += f"{e}\n"
    mermaid_code += "\n"
    for c in click_handlers: mermaid_code += f"{c}\n"

    # Replace placeholders with actual step numbers
    diagram_nodes_sorted = [n for n in nav_seq if n in diagram_nodes]
    for idx, d_id in enumerate(diagram_nodes_sorted):
        mermaid_code = mermaid_code.replace(f"__STEP_{d_id}__", f"{idx + 1}.")

    # Write standalone MMD just in case
    import os
    os.makedirs(f"../site/data/{project_name}", exist_ok=True)
    with open(f"../site/data/{project_name}/diagram.mmd", "w") as f:
        f.write(mermaid_code)

    return mermaid_code
