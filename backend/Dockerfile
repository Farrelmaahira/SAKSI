FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /api ./cmd/api
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /migrate ./cmd/migrate
RUN mkdir -p /data/files && chown -R 65532:65532 /data

FROM alpine:3.20
RUN adduser -D -u 65532 nonroot
COPY --from=build /api /api
COPY --from=build /migrate /migrate
COPY --from=build /src/scripts/SAKSI.sql /scripts/SAKSI.sql
COPY --from=build --chown=65532:65532 /data /data
USER nonroot
ENV PORT=8080
ENTRYPOINT ["/bin/sh", "-c", "/migrate -file /scripts/SAKSI.sql && exec /api"]
