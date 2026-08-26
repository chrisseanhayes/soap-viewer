import sys

def main():
    with open('/Users/chrishayes/Documents/projects/chrishayescodes/soap/data/diagram.mmd', 'r') as f:
        content = f.read()

    # Application Code (🧑‍💻)
    replacements = {
        'AppClient[1. Client Application]': 'AppClient[🧑‍💻 1. Client Application]',
        'AppServer[8. Service Business Logic]': 'AppServer[🧑‍💻 8. Service Business Logic]',
        '|Initiates Request|': '|🧑‍💻 Initiates Request|',
        '|Returns Result / Throws Fault|': '|🧑‍💻 Returns Result / Throws Fault|',
        '|Invokes Logic|': '|🧑‍💻 Invokes Logic|',

        # Library Code (📚)
        'Proxy[2. Client Proxy / Stub]': 'Proxy[📚 2. Client Proxy / Stub]',
        'Serialize[3. Serialize to SOAP Message]': 'Serialize[📚 3. Serialize to SOAP Message]',
        'Deserialize[6. Parse SOAP XML]': 'Deserialize[📚 6. Parse SOAP XML]',
        'Deserialize2[10. Deserialize Response]': 'Deserialize2[📚 10. Deserialize Response]',
        'Validate[7. WSDL Contract Validation]': 'Validate[📚 7. WSDL Contract Validation]',
        'ServerTransport[5. Web Server / Listener]': 'ServerTransport[📚 5. Web Server / Listener]',
        'ClientTransport[9. Client Transport Receives]': 'ClientTransport[📚 9. Client Transport Receives]',
        'ReqEnvelope[SOAP Envelope]': 'ReqEnvelope[📚 SOAP Envelope]',
        'ReqHeader[SOAP Header - Optional]': 'ReqHeader[📚 SOAP Header - Optional]',
        'ReqBody[SOAP Body - Required]': 'ReqBody[📚 SOAP Body - Required]',
        'RespEnvelope[SOAP Envelope]': 'RespEnvelope[📚 SOAP Envelope]',
        'RespHeader[SOAP Header - Optional]': 'RespHeader[📚 SOAP Header - Optional]',
        'RespBody[SOAP Body - Required]': 'RespBody[📚 SOAP Body - Required]',
        'RespFault[SOAP Fault - On Error]': 'RespFault[📚 SOAP Fault - On Error]',
        '|Generates XML|': '|📚 Generates XML|',
        '|Extracts XML|': '|📚 Extracts XML|',
        '|Validates vs WSDL|': '|📚 Validates vs WSDL|',
        '|Generates Response XML|': '|📚 Generates Response XML|',
        '|Deserializes Response XML|': '|📚 Deserializes Response XML|',

        # OS/Hardware Code (⚙️)
        'TransportProtocol[4. Transport Protocol]': 'TransportProtocol[⚙️ 4. Transport Protocol]',
        'TCP[TCP/IP Routing]': 'TCP[⚙️ TCP/IP Routing]',
        '|Wraps in HTTP/SMTP|': '|⚙️ Wraps in HTTP/SMTP|',
        '|☁️ Transmits via Port 80/443|': '|⚙️ ☁️ Transmits via Port 80/443|',
        '|☁️ Receives Payload|': '|⚙️ ☁️ Receives Payload|',
        '|☁️ Returns via Port 80/443|': '|⚙️ ☁️ Returns via Port 80/443|',
        '|☁️ Delivers Response|': '|⚙️ ☁️ Delivers Response|'
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    with open('/Users/chrishayes/Documents/projects/chrishayescodes/soap/data/diagram.mmd', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    main()
