#!/usr/bin/env sh
# Membangkitkan kode Python dari ../proto/saksi/ai/v1/ai.proto ke app/gen/.
# Pakai: PYTHON=.venv/bin/python scripts/gen_proto.sh   (butuh grpcio-tools dari requirements-dev.txt)
set -eu
cd "$(dirname "$0")/.."
"${PYTHON:-python}" -m grpc_tools.protoc -I ../proto/saksi/ai/v1 \
  --python_out=app/gen --grpc_python_out=app/gen --pyi_out=app/gen ai.proto
# protoc menulis import absolut "import ai_pb2"; ubah jadi relatif agar app.gen bisa diimpor.
sed -i.bak 's/^import ai_pb2 as/from . import ai_pb2 as/' app/gen/ai_pb2_grpc.py && rm app/gen/ai_pb2_grpc.py.bak
