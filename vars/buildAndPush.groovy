def call(Map config = [:]) {
    def imageName = config.imageName ?: 'contact-api'
    def tag = config.tag ?: 'latest'
    def registry = config.registry ?: 'docker.io/arjbelaid'
    def credentialsId = config.credentialsId ?: 'dockerhub-token-secret'
    
    def fullImageName = "${registry}/${imageName}:${tag}"

    echo "🐳 Construction de l'image Docker : ${fullImageName}"
    sh "docker build -t ${fullImageName} ."

    // Récupérer le token SANS le masquer dans une variable Groovy
    def token = ""
    withCredentials([string(credentialsId: credentialsId, variable: 'DH_TOKEN')]) {
        token = env.DH_TOKEN
    }

    // Nettoyer le token (supprimer espaces et retours à la ligne)
    token = token.trim().replaceAll("\\s", "")

    echo "🔑 Connexion à Docker Hub..."
    sh "echo '${token}' | docker login docker.io -u arijbelaid --password-stdin"
    
    sleep 3
    
    echo "🚀 Push de l'image Docker : ${fullImageName}"
    sh "docker push ${fullImageName}"
}
