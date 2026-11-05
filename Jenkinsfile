@Library('ci-lib') _

pipeline {
  agent any
  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }
  environment {
    IMAGE_NAME = 'arijbelaid/contact-api'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script { env.SHORT_SHA = env.GIT_COMMIT.take(7) }
      }
    }
    stage('Install') {
      agent { docker { image 'node:24-alpine'; reuseNode true } }
      steps { sh 'npm ci' }
    }
    stage('Quality') {
      parallel {
        stage('Lint') {
          agent { docker { image 'node:24-alpine'; reuseNode true } }
          steps { sh 'npm run lint' }
        }
        stage('Unit tests') {
          agent { docker { image 'node:24-alpine'; reuseNode true } }
          steps {
            sh 'npx vitest run --exclude tests/integration/** --reporter=default --reporter=junit --outputFile.junit=reports/junit.xml'
          }
        }
      }
    }
    // 👇 UTILISATION DE LA SHARED LIBRARY AVEC LE NOUVEAU CREDENTIAL 👇
    stage('Build & Push Image') {
      steps {
        script {
          // On récupère juste 'contact-api' à partir de 'arijbelaid/contact-api'
          def imageBase = env.IMAGE_NAME.split('/')[-1]

          // On force le bon registre Docker Hub
          def registryBase = 'docker.io/arjbelaid'

          buildAndPush(
            imageName: imageBase, // 'contact-api'
            tag: env.SHORT_SHA,
            registry: registryBase, // 'docker.io/arjbelaid'
            credentialsId: 'dockerhub-v2' // <-- LE NOUVEAU CREDENTIAL ICI
          )
        }
      }
    }
  }
  post {
    always {
      junit 'reports/junit.xml'
    }
    success {
      echo 'Pipeline réussi.'
    }
    cleanup {
      deleteDir()
    }
  }
}
