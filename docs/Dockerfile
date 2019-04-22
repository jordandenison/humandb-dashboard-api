FROM alpine:3.1

RUN apk add --update nginx && mkdir /tmp/nginx && rm -rf /var/cache/apk/* && mkdir -p /var/www

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./mime.types /etc/nginx/mime.types
COPY ./src /var/www/docs

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]