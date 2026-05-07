FROM nginx:stable-alpine

# 将生成的 dist 文件夹（Vue通常是dist，React通常是build）拷贝到 Nginx 目录
COPY dist/ /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]