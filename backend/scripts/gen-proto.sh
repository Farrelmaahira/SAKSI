#!/bin/sh
# Bangkitkan klien gRPC Go dari proto/ (milik ML) ke backend/gen/.
# Butuh: protoc, protoc-gen-go, protoc-gen-go-grpc (go install google.golang.org/protobuf/cmd/protoc-gen-go@latest google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest).
set -eu
cd "$(dirname "$0")/.."
protoc -I ../proto \
  --go_out=. --go_opt=module=saksi-backend \
  --go-grpc_out=. --go-grpc_opt=module=saksi-backend \
  ../proto/saksi/ai/v1/ai.proto
