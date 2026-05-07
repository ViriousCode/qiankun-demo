#!/usr/bin/env bash
set -e
platform=${1-"amd64"}
mode=${2-"production"}
image="azura-framework"
IMAGE_TAG="git.azuratech.com:3000/core/$image:latest"
function save_and_export() {
    local save_file=$1;
    docker save ${IMAGE_LATEST_TAG} | gzip -9 >$save_file
    if [[ $(uname -a) == *"MINGW"* || $(uname -a) == *"Msys"* ]]; then
        explorer.exe "/select,$(cygpath -w "$PWD/$save_file")"
    else
        explorer.exe /select, $save_file
    fi
}

function build_platform() {
    # 单平台，可以直接load
    echo "开始构建$image"
    docker buildx build -t ${IMAGE_TAG} --platform=linux/${platform} . --load
    docker save ${IMAGE_TAG} | gzip -9 >$image.${platform}.tar.gz
    # save_and_export $image.${platform}.tar.gz
    # echo "执行" bash cli/deploy_ninghai.sh 部署
}
_mode=${mode-"production"}
# yarn build:init --mode=$_mode
yarn build --mode=$_mode
build_platform
