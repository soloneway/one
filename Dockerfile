FROM teddysun/xray:latest
ENTRYPOINT []
CMD ["sh","-c","echo \"$XCFG\" | base64 -d > /tmp/c.json && exec xray run -c /tmp/c.json"]
