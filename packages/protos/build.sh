#!/bin/bash
protoc --plugin=$(npm root)/.bin/protoc-gen-ts_proto \
 --ts_proto_out=dist \
 --ts_proto_opt=outputServices=grpc-js \
 --ts_proto_opt=esModuleInterop=true \
 -I=src/ src/**/*.proto