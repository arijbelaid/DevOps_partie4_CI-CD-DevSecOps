def call(Map config = [:]) {
    def imageName = config.imageName ?: 'contact-api'
    def tag = config.tag ?: 'latest'
    def registry = config.registry ?: 'docker.io/arjbelaid'
    def credentialsId = config.credentialsId ?: 'dockerhub'
    
    def fullImageName = "${registry}/${imageName}:${tag}"

    echo "🐳 Construction de l'image Docker : ${fullImageName}"
    sh "docker build -t ${fullImageName} ."

    echo "🚀 Push de l'image Docker : ${fullImageName}"
    withCredentials([usernamePassword(credentialsId: credentialsId, usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
        sh 'echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin'
        sh "docker push ${fullImageName}"
    }
}
