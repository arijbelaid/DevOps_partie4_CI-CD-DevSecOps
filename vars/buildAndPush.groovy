def call(Map config = [:]) {
    def imageName = config.imageName ?: 'contact-api'
    def tag = config.tag ?: 'latest'
    def registry = config.registry ?: 'docker.io/arjbelaid'
    def credentialsId = config.credentialsId ?: 'dockerhub-token-secret'
    
    def fullImageName = "${registry}/${imageName}:${tag}"

    echo "🐳 Construction de l'image Docker : ${fullImageName}"
    sh "docker build -t ${fullImageName} ."

    echo "🚀 Push de l'image Docker : ${fullImageName}"
    // On utilise 'string' au lieu de 'usernamePassword'
    withCredentials([string(credentialsId: credentialsId, variable: 'DH_TOKEN')]) {
        sh 'echo "$DH_TOKEN" | docker login -u arijbelaid --password-stdin'
        sh "docker push ${fullImageName}"
    }
}
