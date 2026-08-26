import json
import re
import glob

# Load content
with open('soap/data/content.json', 'r') as f:
    content = json.load(f)

# Sequence from app.js
seq = [
    'AppClient', 'EdgeInitiatesRequest', 'Proxy', 'EdgeGeneratesXML', 'Serialize',
    'OSILayer7_BigPicture', 'OSILayer7', 'EdgeWrapsInHTTP', 'TransportProtocol', 'SOAPMessage_BigPicture', 'SOAPMessage', 'ReqEnvelope',
    'ReqHeader', 'ReqBody', 'EdgeTransmits', 'OSILowerLayers_BigPicture', 'OSILowerLayers', 'TCP', 'EdgeReceivesPayload',
    'Server_BigPicture', 'Server', 'ServerTransport', 'EdgeExtractsXML', 'Deserialize', 'EdgeValidatesWSDL', 'Validate',
    'EdgeInvokesLogic', 'AppServer', 'EdgeGeneratesResponseXML', 'SOAPResponse_BigPicture', 'SOAPResponse', 'RespEnvelope', 'RespHeader', 'RespBody',
    'RespFault', 'EdgeReturnsViaPort', 'EdgeDeliversResponse', 'ClientTransport',
    'EdgeDeserializesResponseXML', 'Deserialize2', 'EdgeReturnsResult'
]

pill_map = {
    'Network': ['EdgeTransmits', 'EdgeReceivesPayload', 'EdgeReturnsViaPort', 'EdgeDeliversResponse'],
    'ApplicationCode': ['EdgeInitiatesRequest', 'EdgeReturnsResult', 'EdgeInvokesLogic'],
    'LibraryCode': ['EdgeGeneratesXML', 'EdgeExtractsXML', 'EdgeValidatesWSDL', 'EdgeGeneratesResponseXML', 'EdgeDeserializesResponseXML'],
    'OSHardwareCode': ['EdgeWrapsInHTTP', 'EdgeTransmits', 'EdgeReceivesPayload', 'EdgeReturnsViaPort', 'EdgeDeliversResponse']
}

def escape_xml(text):
    if not text: return ""
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

for xml_file in glob.glob('soap-xml/nodes/*.xml'):
    with open(xml_file, 'r') as f:
        xml_data = f.read()

    # Find all edge tags: <edge ... edgeKey="X" ... />
    # We use a regex that handles multiline
    pattern = r'<edge([^>]*)edgeKey="([^"]+)"([^>]*)/>'
    
    def repl(m):
        pre = m.group(1)
        key = m.group(2)
        post = m.group(3)
        
        # If this is not an edge from content.json, return as is
        if key not in content['nodes']:
            return f'<edge{pre}edgeKey="{key}"{post}/>'
            
        edge_data = content['nodes'][key]
        
        # Navigation
        idx = seq.index(key)
        prev = seq[idx-1] if idx > 0 else 'null'
        nxt = seq[idx+1] if idx < len(seq)-1 else 'null'
        
        # Pills
        pills = []
        for p, keys in pill_map.items():
            if key in keys:
                pills.append(f'        <definitionRef id="{p}" file="soap-xml/definitions/{p}.xml"/>')
        pills_str = "\n".join(pills)
        
        # Build expanded XML
        inner = []
        inner.append(f'      <sidebar>')
        inner.append(f'        <title>{escape_xml(edge_data.get("title", ""))}</title>')
        if "overview" in edge_data:
            inner.append(f'        <overview>{escape_xml(edge_data["overview"])}</overview>')
        if "handledBy" in edge_data:
            inner.append(f'        <handledBy>{escape_xml(edge_data["handledBy"])}</handledBy>')
        if "devImpact" in edge_data:
            inner.append(f'        <devImpact>{escape_xml(edge_data["devImpact"])}</devImpact>')
        if "considerations" in edge_data:
            inner.append(f'        <considerations>{escape_xml(edge_data["considerations"])}</considerations>')
        inner.append(f'      </sidebar>')
        inner.append(f'      <definitionPills>')
        inner.append(pills_str)
        inner.append(f'      </definitionPills>')
        inner.append(f'      <navigation>')
        inner.append(f'        <sequenceIndex>{idx}</sequenceIndex>')
        inner.append(f'        <stepCounter>Step {idx+1} of {len(seq)}</stepCounter>')
        inner.append(f'        <prev>{prev}</prev>')
        inner.append(f'        <next>{nxt}</next>')
        inner.append(f'      </navigation>')
        
        inner_str = "\n".join(inner)
        
        # Format the open tag, the inner content, and close tag
        return f'<edge{pre}edgeKey="{key}"{post}>\n{inner_str}\n      </edge>'
        
    new_xml = re.sub(pattern, repl, xml_data, flags=re.DOTALL)
    
    with open(xml_file, 'w') as f:
        f.write(new_xml)

print("Done injecting edges.")
