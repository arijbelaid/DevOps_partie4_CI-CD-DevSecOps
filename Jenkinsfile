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
            sh 'npx vitest run --reporter=default --reporter=junit --outputFile.junit=reports/junit.xml'
          }
        }
      }
    }
    // 👇 C'EST ICI QU'ON UTILISE LA SHARED LIBRARY 👇
    stage('Build & Push Image') {
      steps {
        script {
          // On sépare l'image du tag pour notre fonction
          // IMAGE_NAME vaut 'arijbelaid/contact-api', on veut 'contact-api' comme nom d'image
          def imageBase = env.IMAGE_NAME.split('/')[-1] 
          def registryBase = env.IMAGE_NAME.split('/')[0] + ".io" // docker.io
          
          buildAndPush(
            imageName: imageBase,
            tag: env.SHORT_SHA,
            registry: registryBase,
            credentialsId: 'dockerhub' // ⚠️ Vérifie que c'est bien le nom de ton credential Jenkins
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
      deleteDir() // Nettoie le workspace
    }
  }
}
