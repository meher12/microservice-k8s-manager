

# Démarrer le Serveur Angular avec le Proxy

### Lancez le serveur Angular avec la configuration proxy :
```
ng serve --proxy-config proxy.conf.json
```

L'ajout de proxy en local est principalement utilisé dans l'environnement de développement. Lorsque vous configurez un proxy via un fichier proxy.conf.json et que vous lancez votre serveur Angular avec ng serve --proxy-config proxy.conf.json, cela permet à votre application Angular de rediriger certaines requêtes API vers un serveur backend pendant que vous développez localement.
Pourquoi le Proxy Est Principalement Utilisé en Environnement de Développement :

    Facilité de Développement : Il permet aux développeurs de séparer le frontend et le backend tout en travaillant localement.

    Simplification des Requêtes API : Les développeurs n'ont pas besoin de mettre à jour les URL des API dans chaque requête.

    Éviter les Problèmes de CORS : En redirigeant les requêtes API localement, les problèmes de CORS (Cross-Origin Resource Sharing) peuvent être évités pendant le développement.

En Production

En production, vous n'utiliserez généralement pas ng serve, mais vous allez compiler et servir votre application Angular avec un serveur web comme Nginx ou Apache. Ces serveurs web peuvent également être configurés pour rediriger les requêtes API.

#### Exemple de Configuration Nginx pour la Production :
```
server {
    listen 80;
    server_name my-angular-app.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend-server:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```


