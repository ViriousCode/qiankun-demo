#!/usr/bin/env bash
set -e

platform=${1-"amd64"}
image="azura-framework-serve"
IMAGE_TAG="${image}:latest"

function build_platform() {
  echo "开始构建${image}"
  docker buildx build -t "${IMAGE_TAG}" --platform="linux/${platform}" -f "serve/Dockerfile" "serve" --load
  docker save "${IMAGE_TAG}" | gzip -9 >"${image}.${platform}.tar.gz"
  echo "✅ 已生成 ${image}.${platform}.tar.gz"
}

build_platform

