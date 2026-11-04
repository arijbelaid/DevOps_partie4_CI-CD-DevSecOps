pipeline {
  agent any
  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }
  environment {
    IMAGE_NAME = 'arijbelaid/contact-api' // ⚠️ Vérifie bien ton nom Docker Hub
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
          post {
            always { 
              junit testResults: 'reports/junit.xml'
            }
          }
        }
      }
    }
    stage('Build image') {
      steps {
        sh 'docker build -t $IMAGE_NAME:$SHORT_SHA --label org.opencontainers.image.revision=$GIT_COMMIT .'
      }
    }
    stage('Push') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub',
                          usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
          sh 'echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin'
          sh 'docker push $IMAGE_NAME:$SHORT_SHA'
          sh 'docker tag $IMAGE_NAME:$SHORT_SHA $IMAGE_NAME:latest-main'
          sh 'docker push $IMAGE_NAME:latest-main'
        }
        sh 'echo "$IMAGE_NAME:$SHORT_SHA" > image.txt'
        archiveArtifacts artifacts: 'image.txt'
      }
    }
  }
  post {
    always {
      junit testResults: 'reports/junit.xml', allowEmptyResults: true
    }
    success {
      echo 'Pipeline réussi.'
    }
    failure {
      echo 'Le pipeline a échoué.'
    }
    cleanup {
      cleanWs()
    }
  }
}
