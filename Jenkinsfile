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
    IMAGE_NAME = 'arjbelaid/contact-api'
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
    stage('Build & Push Image') {
      steps {
        script {
          def imageBase = env.IMAGE_NAME.split('/')[-1]
          def registryBase = 'arjbelaid'

          buildAndPush(
            imageName: imageBase,
            tag: env.SHORT_SHA,
            registry: registryBase,
            credentialsId: 'dockerhub-token-secret'
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
