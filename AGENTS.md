# Graphify Instructions

- Use Graphify to understand the codebase
  before implementing significant changes.
- Check whether the knowledge graph exists.
- Update the graph when significant codebase
  changes make it outdated.
- Use Graphify query to trace dependencies
  and understand related components.
- Do not blindly trust the graph. Verify
  important findings against source code.

# Postman Instructions

- Maintain Postman collection file at
  docs/saksi-api.postman_collection.json.
- Always update the collection when endpoints
  are added, modified, or deleted.
- Use baseUrl variable for all requests
  defaulting to http://localhost:8080/api/v1.
- Use authToken variable for Bearer token
  on all protected endpoints.
- Include role-specific registration bodies
  for kades, penyedia, and warga.
- Add test script on login endpoint
  to automatically store authToken.
- Keep JSON schema strictly valid according
  to Postman Collection v2.1.0.
