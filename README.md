

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

# Importance des StatefulSets :
- Les StatefulSets sont utilisés pour gérer des applications avec état (stateful) qui nécessitent :
  - Une identité réseau stable et unique pour chaque pod
  - Un stockage persistant
  - Un ordre de déploiement et de mise à l'échelle prévisible

Dans ton cas, le StatefulSet est important car :
```yaml
spec:
  serviceName: "order-headless-service"  # Identité réseau stable
  volumeClaimTemplates:                  # Stockage persistant
    - metadata:
        name: order-storage
```

2. Pourquoi deux services ?

A) Le Service Headless (order-headless-service) :
```yaml
spec:
  clusterIP: None  # Caractéristique d'un service headless
```
- Est utilisé par le StatefulSet pour créer des DNS records stables
- Permet d'accéder directement à chaque pod individuellement
- Format DNS : <pod-name>.<service-name>.<namespace>.svc.cluster.local
- Essentiel pour les applications distribuées nécessitant une communication pod-à-pod

B) Le Service Regular (order-service) :
```yaml
spec:
  selector:
    app: order-products
  ports:
    - port: 3002
```
- Fournit un point d'entrée unique pour accéder au service
- Fait de l'équilibrage de charge entre les pods
- Utilisé pour les communications externes ou depuis d'autres services

Exemple concret :
- Si on a 3 replicas, on aura :
  - Via le service headless : 
    - order-statefulset-0.order-headless-service
    - order-statefulset-1.order-headless-service
    - order-statefulset-2.order-headless-service
  - Via le service regular :
    - order-service (qui distribue le trafic entre les pods)

Cette configuration est particulièrement utile pour :
1. Les bases de données distribuées
2. Les systèmes de messagerie
3. Les applications nécessitant une coordination entre les instances
# PersistentVolume (PV) et  PersistentVolumeClaim (PVC)

1. PersistentVolume (PV)
On choisit un PV quand :
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: example-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  hostPath:
    path: /data/pv
```
- On est administrateur du cluster
- On souhaite pré-provisionner du stockage
- On a besoin de gérer directement l'infrastructure de stockage
- On veut définir des détails spécifiques comme :
  - Le type de stockage (NFS, cloud storage, etc.)
  - Les paramètres de performance
  - Les politiques de rétention

2. PersistentVolumeClaim (PVC)
On choisit un PVC quand :
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```
- On est développeur d'application
- On veut demander du stockage sans se soucier des détails d'implémentation
- On a besoin de :
  - Spécifier uniquement la taille nécessaire
  - Définir le mode d'accès requis
  - Référencer le stockage dans les pods

3. Workflow typique :
```yaml
# 1. L'admin crée le PV
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: standard

# 2. Le développeur crée le PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi

# 3. Utilisation dans un Pod
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
    - name: app
      volumeMounts:
        - mountPath: "/data"
          name: app-volume
  volumes:
    - name: app-volume
      persistentVolumeClaim:
        claimName: app-pvc
```

4. Cas d'utilisation courants :
- PV :
  - Configuration d'un cluster production
  - Gestion de différents types de stockage
  - Contrôle précis des ressources

- PVC :
  - Développement d'applications
  - Déploiement de services stateful
  - Abstraction des détails du stockage

5. Storage Classes :
- Une alternative moderne qui permet le provisionnement dynamique
- Permet d'éviter de créer manuellement les PV
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
```

En résumé :
- On utilise PV quand on est admin et qu'on veut contrôler le stockage
- On utilise PVC quand on est développeur et qu'on veut consommer du stockage
- On considère les Storage Classes pour l'automatisation

# Contrôle du bon fonctionnement du PVC:

1. Vérifiez que le PVC a été créé :
```bash
kubectl get pvc -n local-microservices
```

2. Vérifiez le montage dans le pod :
```bash
kubectl exec -it order-statefulset-0 -n local-microservices -- df -h
# ou
kubectl exec -it order-statefulset-0 -n local-microservices -- mount | grep data
```

3. Créez un fichier test pour vérifier la persistance :
```bash
kubectl exec -it order-statefulset-0 -n local-microservices -- touch /data/testfile
kubectl exec -it order-statefulset-0 -n local-microservices -- ls -la /data
```

Pour vérifier que tout fonctionne correctement, on peut faire quelques tests :

1. Créons un fichier test dans le volume persistant :
```bash
kubectl exec -it order-statefulset-0 -n local-microservices -- /bin/sh -c "echo 'test data' > /data/testfile.txt"
```

2. Vérifions que le fichier a été créé :
```bash
kubectl exec -it order-statefulset-0 -n local-microservices -- ls -l /data
```

3. Lisons son contenu :
```bash
kubectl exec -it order-statefulset-0 -n local-microservices -- cat /data/testfile.txt
```

4. Test de persistance : supprimons le pod et vérifions que les données persistent :
```bash
# Supprimons le pod (il sera recréé automatiquement par le StatefulSet)
kubectl delete pod order-statefulset-0 -n local-microservices

# Attendons que le nouveau pod soit prêt
kubectl wait --for=condition=ready pod -l app=order-products -n local-microservices

# Vérifions que notre fichier existe toujours
kubectl exec -it order-statefulset-0 -n local-microservices -- ls -l /data
kubectl exec -it order-statefulset-0 -n local-microservices -- cat /data/testfile.txt
```

Si on veut voir les détails du PVC :
```bash
kubectl get pvc -n local-microservices
kubectl describe pvc order-storage-order-statefulset-0 -n local-microservices
```

Ces commandes devraient confirmer que le stockage persistant fonctionne correctement. Les données dans `/data` persisteront même si le pod est supprimé et recréé.

# Les étapes à suivre pour supprimer un PVC:

Pour supprimer les PVC, il y a une séquence à suivre car les PVC sont liés aux StatefulSets. Voici la procédure :

1. D'abord, on supprime le StatefulSet :
```bash
kubectl delete statefulset order-statefulset -n local-microservices
```

2. Ensuite, on peut lister les PVC :
```bash
kubectl get pvc -n local-microservices
```

3. Pour supprimer les PVC, on a deux options :

Option 1 - Supprimer un PVC spécifique :
```bash
kubectl delete pvc order-storage-order-statefulset-0 -n local-microservices
kubectl delete pvc order-storage-order-statefulset-1 -n local-microservices
```

Option 2 - Supprimer tous les PVC du namespace :
```bash
kubectl delete pvc --all -n local-microservices
```

### ATTENTION :
- La suppression d'un PVC est DÉFINITIVE et supprime toutes les données stockées
- Si le PVC est toujours utilisé par un pod, il faut d'abord supprimer le pod
- Il peut y avoir une politique de rétention qui empêche la suppression directe

Pour vérifier que tout est bien supprimé :
```bash
# Vérifier qu'il n'y a plus de PVC
kubectl get pvc -n local-microservices

# Vérifier qu'il n'y a plus de PV associés
kubectl get pv | grep local-microservices
```

Si un PVC reste bloqué en état "Terminating", on peut le forcer à se supprimer :
```bash
kubectl patch pvc order-storage-order-statefulset-0 -n local-microservices -p '{"metadata":{"finalizers":null}}'
```

# Les étapes à suivre pour modifier le stockage d'un PVC dans un StatefulSet:
Pour modifier le stockage d'un PVC dans un StatefulSet, voici la procédure car on ne peut pas modifier directement la taille d'un PVC existant dans un StatefulSet :

1. D'abord, sauvegardons les données si nécessaire :
```bash
# Exemple de sauvegarde si nécessaire
kubectl exec -it order-statefulset-0 -n local-microservices -- tar czf /tmp/backup.tar.gz /data
```

2. Modifions le StatefulSet avec la nouvelle taille (par exemple 200M au lieu de 100M) :
```yaml
  volumeClaimTemplates:
  - metadata:
      name: order-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "standard"
      resources:
        requests:
          storage: 200M  # Nouvelle taille
```

3. Supprimons l'ancien StatefulSet et les PVC :
```bash
# Supprimer le StatefulSet
kubectl delete statefulset order-statefulset -n local-microservices

# Supprimer les PVC
kubectl delete pvc order-storage-order-statefulset-0 -n local-microservices
kubectl delete pvc order-storage-order-statefulset-1 -n local-microservices
```

4. Appliquons le nouveau StatefulSet :
```bash
kubectl apply -f statefulset.yaml
```

5. Vérifions que les nouveaux PVC sont créés avec la bonne taille :
```bash
# Vérifier les PVC
kubectl get pvc -n local-microservices

# Voir les détails d'un PVC spécifique
kubectl describe pvc order-storage-order-statefulset-0 -n local-microservices
```

6. Restaurons les données si nécessaire :
```bash
# Exemple de restauration si une sauvegarde a été faite
kubectl exec -it order-statefulset-0 -n local-microservices -- tar xzf /tmp/backup.tar.gz -C /
```
### Note importante :
- La réduction de la taille n'est pas possible
- Certains environnements ne supportent pas l'extension de volume
- Toujours faire une sauvegarde avant de modifier le stockage




