# 🚀 TP9 : Pipeline as Code avec Jenkins & Shared Library

<div align="center">

### CI/CD • Docker Agents • Parallel Stages • Multibranch Pipeline

![Jenkins](https://img.shields.io/badge/Jenkins-Pipeline_as_Code-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Agents-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Multibranch-181717?style=for-the-badge&logo=github&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-Automation-6C63FF?style=for-the-badge)

**Master DevOps & Cloud — ISET Tozeur**

</div>

---

## 📖 Présentation du projet

Ce projet met en œuvre un pipeline **CI/CD (Intégration Continue / Déploiement Continu)** pour l'API Node.js `contact-api`.

Il illustre les concepts avancés de Jenkins à travers l'approche **Pipeline as Code**, l'utilisation d'agents Docker éphémères, l'exécution parallèle des stages, la gestion sécurisée des credentials, le tagging des images Docker basé sur le Git SHA et la création d'une Shared Library réutilisable.

L'objectif est de garantir un feedback rapide aux développeurs, une traçabilité entre le code source et l'image Docker construite, ainsi qu'une gestion sécurisée des secrets.

## 🎯 Objectifs pédagogiques

- Comprendre le fonctionnement d'un pipeline Jenkins déclaratif.
- Définir les étapes CI/CD dans un fichier `Jenkinsfile`.
- Utiliser des agents Docker pour exécuter les stages.
- Exécuter les opérations de qualité en parallèle.
- Générer et publier les rapports de tests JUnit.
- Gérer les credentials Jenkins de manière sécurisée.
- Construire une image Docker taguée avec le Git SHA.
- Publier l'image Docker uniquement depuis la branche `main`.
- Configurer un Multibranch Pipeline connecté à GitHub.
- Factoriser les opérations Docker dans une Shared Library Jenkins.

## 🏗️ Architecture du pipeline

Le pipeline est défini dans le fichier `Jenkinsfile` et suit le workflow suivant :

```text
                    GitHub Repository
                           |
                           v
                      Jenkins
                           |
                           v
                       Checkout
                           |
                           v
                        Install
                           |
                           v
                  Quality (Parallel)
                    /           \
                   v             v
                 Lint        Unit Tests
                    \           /
                     v         v
                       Build
                         |
                         v
                    Docker Image
                         |
                         v
                    Git SHA Tag
                         |
                         v
                  Shared Library
                         |
                         v
                   Docker Hub Push
                    (main only)
                         |
                         v
                    Post Actions
```

Les stages `Lint` et `Unit tests` sont exécutés en parallèle afin de réduire le temps de feedback.

La publication de l'image Docker est réservée à la branche `main`.

## 📂 Structure du dépôt

```text
contact-api/
│
├── Jenkinsfile
│
├── vars/
│   └── buildAndPush.groovy
│
├── src/
│   └── Code source de l'API
│
├── tests/
│   └── Tests unitaires
│
├── Dockerfile
│
├── package.json
│
├── README.md
│
└── captures/
    ├── pipeline-stages.png
    ├── junit-report.png
    ├── credentials-masked.png
    ├── dockerhub-sha-tag.png
    ├── multibranch.png
    └── shared-library.png
```

---

# 🛠️ Configuration de l'environnement Jenkins

## 🔌 Plugins Jenkins requis

- Pipeline
- Git
- GitHub Branch Source
- Docker Pipeline
- JUnit
- Credentials Binding
- Workspace Cleanup
- Timestamper

## 🔑 Credentials Jenkins

| ID | Type | Description |
|---|---|---|
| `dockerhub` | Username with password | Identifiant Docker Hub et access token |
| `github-credentials` | Username with password | Identifiant GitHub et token d'accès |

Les credentials sont enregistrés dans Jenkins et utilisés uniquement pendant les opérations nécessitant une authentification.

## 📚 Configuration de la Shared Library

| Paramètre | Valeur |
|---|---|
| Name | `ci-lib` |
| Default version | `main` |
| Retrieval method | Modern SCM |
| SCM | Git |
| Project Repository | URL du dépôt GitHub de la bibliothèque |

---

# 🧪 Partie 1 — Premier pipeline depuis le dépôt

## 1. Ajouter le script de lint dans package.json

Le projet `contact-api` utilise un script de lint afin de vérifier la syntaxe du code JavaScript.

Cette étape permet de détecter les erreurs avant l'exécution des tests et la construction de l'image Docker.

### 📸 Capture 01 — Script Lint

**Fichier :** `captures/pipeline-stages.png`

> Cette capture correspond à la configuration du script lint dans `package.json` et à son intégration dans le pipeline.

## 2. Créer le job Jenkins et lancer le build

Un job de type Pipeline est configuré dans Jenkins avec le dépôt GitHub du projet.

Le fichier `Jenkinsfile` est utilisé comme source de définition du pipeline.

### 📸 Capture 02 — Configuration du job Jenkins

**Fichier :** `captures/pipeline-stages.png`

> Cette capture présente la configuration du job Pipeline connecté au dépôt GitHub et le lancement du build Jenkins.

---

# 🐳 Partie 2 — Agents Docker, parallélisme et rapports JUnit

## 1. Faire échouer un test volontairement

Un test est volontairement rendu incorrect afin de vérifier le comportement du pipeline lorsqu'une erreur survient.

Cette étape permet d'observer l'échec des tests et l'arrêt des stages suivants dépendants de leur réussite.

### 📸 Capture 03 — Test volontairement échoué

**Fichier :** `captures/junit-report.png`

> Cette capture montre le résultat du test en échec et permet de vérifier le comportement du pipeline Jenkins.

## 2. Réparer le test

Après la correction du test, le pipeline est relancé.

Les résultats sont générés au format JUnit et publiés dans Jenkins.

### 📸 Capture 04 — Rapport JUnit

**Fichier :** `captures/junit-report.png`

> Cette capture présente les résultats des tests unitaires dans Jenkins après correction.

---

# 🔐 Partie 3 — Image Docker, Git SHA et Credentials

## 1. Générer un token d'accès Docker Hub

Un access token Docker Hub est créé pour permettre l'authentification du pipeline Jenkins.

Le token est utilisé pour les opérations de connexion et de publication de l'image Docker.

### 📸 Capture 05 — Token Docker Hub

**Fichier :** `captures/credentials-masked.png`

> Cette capture documente la création du token d'accès Docker Hub. La valeur du token ne doit jamais être visible.

## 2. Ajouter le credential Docker Hub dans Jenkins

Le credential Docker Hub est enregistré dans Jenkins sous l'identifiant :

```text
dockerhub
```

Il permet au pipeline de s'authentifier sans intégrer les secrets directement dans le code source.

### 📸 Capture 06 — Credentials Jenkins

**Fichier :** `captures/credentials-masked.png`

> Cette capture présente le credential Docker Hub configuré dans Jenkins sans exposer sa valeur.

## 3. Relancer le build

Le pipeline est relancé afin de vérifier la construction de l'image Docker et son processus d'authentification.

L'image est taguée avec le Git SHA court pour assurer la traçabilité du commit.

### 📸 Capture 07 — Build et publication Docker

**Fichier :** `captures/dockerhub-sha-tag.png`

> Cette capture présente le résultat du build et la référence de l'image Docker construite avec le tag Git SHA.

---

# 🌿 Partie 4 — Multibranch Pipeline

## 1. Créer le credential GitHub dans Jenkins

Un credential GitHub est créé dans Jenkins afin de permettre l'accès au dépôt et la découverte des branches et Pull Requests.

### 📸 Capture 08 — Credential GitHub

**Fichier :** `captures/multibranch.png`

> Cette capture présente le credential GitHub configuré dans Jenkins.

## 2. Créer le job Multibranch Pipeline

Un job Multibranch Pipeline est configuré pour analyser le dépôt GitHub.

Le scan périodique permet de détecter les nouvelles branches et Pull Requests.

### 📸 Capture 09 — Multibranch Pipeline

**Fichier :** `captures/multibranch.png`

> Cette capture présente le job Multibranch et les branches détectées par Jenkins.

## 3. Créer une branche

Une branche de fonctionnalité est créée afin de tester le fonctionnement du pipeline sur une branche différente de `main`.

### 📸 Capture 10 — Branche Feature

**Fichier :** `captures/multibranch.png`

> Cette capture présente la branche de fonctionnalité créée dans le dépôt GitHub.

## 4. Faire le merge

La branche de fonctionnalité est intégrée dans la branche principale après la validation de la Pull Request.

### 📸 Capture 11 — Merge dans main

**Fichier :** `captures/multibranch.png`

> Cette capture présente l'intégration de la branche de fonctionnalité dans `main`.

## 5. Tester le stage Push sur la branche

Le pipeline est exécuté sur la branche de fonctionnalité afin de vérifier que le stage Push n'est pas exécuté en dehors de `main`.

### 📸 Capture 12 — Vérification du stage Push

**Fichier :** `captures/multibranch.png`

> Cette capture présente le comportement du stage Push sur la branche de fonctionnalité.

## 6. Vérification du pipeline Multibranch

Le pipeline est vérifié sur les branches et Pull Requests ainsi que sur la branche principale après le merge.

La publication de l'image Docker est conditionnée par la branche `main`.

### 📸 Capture 13 — Vérification finale

**Fichier :** `captures/multibranch.png`

> Cette capture présente la vérification finale du pipeline Multibranch et du comportement de publication.

---

# 📚 Défi — Shared Library Jenkins

## 1. Créer le fichier de la Shared Library

La logique de construction et de publication de l'image Docker est extraite dans une bibliothèque Jenkins réutilisable.

Le fichier utilisé est :

```text
vars/buildAndPush.groovy
```

Cette bibliothèque permet de centraliser les opérations Docker et de réduire la duplication du code dans les pipelines.

### 📸 Capture 14 — Shared Library

**Fichier :** `captures/shared-library.png`

> Cette capture présente le fichier `buildAndPush.groovy` contenant la fonction réutilisable.

## 2. Déclarer la bibliothèque dans Jenkins et lancer le build

La bibliothèque est déclarée dans le `Jenkinsfile` avec :

```groovy
@Library('ci-lib') _
```

La fonction `buildAndPush()` est ensuite appelée pour effectuer les opérations de build et de publication Docker.

### 📸 Capture 15 — Build avec Shared Library

**Fichier :** `captures/shared-library.png`

> Cette capture présente le pipeline utilisant la Shared Library et le résultat du build Jenkins.

---

# 📸 Livrables et captures d'écran

Les captures d'écran du TP sont organisées dans le dossier `captures/`.

| Fichier | Description |
|---|---|
| `pipeline-stages.png` | Script lint, configuration et exécution du pipeline Jenkins |
| `junit-report.png` | Test volontairement échoué et rapport JUnit après correction |
| `credentials-masked.png` | Credentials Docker Hub et token masqué dans la console |
| `dockerhub-sha-tag.png` | Image Docker Hub taguée avec le Git SHA |
| `multibranch.png` | Job Multibranch, branches, Pull Request et vérification du stage Push |
| `shared-library.png` | Shared Library et pipeline utilisant la fonction `buildAndPush()` |

## ✅ Résultat final

Ce TP permet de mettre en pratique les principes du **Pipeline as Code** avec Jenkins.

Il démontre l'automatisation des étapes de validation, de test, de construction et de publication d'une application Node.js, tout en intégrant les agents Docker, les stages parallèles, la gestion sécurisée des credentials, le versionnement Git SHA et le Multibranch Pipeline.

La Shared Library permet de factoriser les opérations Docker et de rendre le pipeline plus réutilisable.

---

<div align="center">

**TP9 — Pipeline as Code avec Jenkins**

Master DevOps & Cloud  
ISET Tozeur

</div>
