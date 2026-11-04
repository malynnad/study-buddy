#!/bin/zsh
cd "$(dirname "$0")" || exit 1
PORT=3000
URL="http://localhost:$PORT"

if curl -s -o /dev/null "$URL"; then
  echo "服务已经在运行了，直接在浏览器打开：$URL"
  open "$URL"
  exit 0
fi

echo "正在启动，浏览器会自动打开 $URL"
echo "关闭这个终端窗口即可停止服务。"
(sleep 1.2; open "$URL") &
exec node server.js
