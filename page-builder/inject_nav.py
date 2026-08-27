import xml.etree.ElementTree as ET
import glob

# The mappings of container IDs to their sequence indices
containers = {
    'OSILayer7': 6,
    'SOAPMessage': 10,
    'OSILowerLayers': 16,
    'Server': 20,
    'SOAPResponse': 30
}

import sys
project_name = sys.argv[1] if len(sys.argv) > 1 else 'soap'
for f in glob.glob(f"../data/{project_name}/nodes/*.xml"):
    tree = ET.parse(f)
    root = tree.getroot()
    
    modified = False
    
    def process_node(node):
        global modified
        node_id = node.get('id')
        if node_id in containers:
            if node.find('navigation') is None:
                nav = ET.Element('navigation')
                seq = ET.SubElement(nav, 'sequenceIndex')
                seq.text = str(containers[node_id])
                
                # Insert navigation right before the first child <node> or at the end
                child_idx = len(node)
                for i, child in enumerate(node):
                    if child.tag == 'node':
                        child_idx = i
                        break
                node.insert(child_idx, nav)
                modified = True
                
        for child in node.findall('node'):
            process_node(child)
            
    process_node(root)
    if modified:
        ET.indent(tree, space="  ", level=0)
        tree.write(f, encoding="UTF-8", xml_declaration=True)

print("Injected nav tags!")
