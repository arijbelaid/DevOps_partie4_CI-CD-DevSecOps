def call(Map config = [:]) {
    def imageName = config.imageName ?: 'contact-api'
    def tag = config.tag ?: 'latest'
    def registry = config.registry ?: 'docker.io/arjbelaid'
    def credentialsId = config.credentialsId ?: 'dockerhub-token-secret'
    
    def fullImageName = "${registry}/${imageName}:${tag}"

    echo "🐳 Construction de l'image Docker : ${fullImageName}"
    sh "docker build -t ${fullImageName} ."

    // Étape 1 : Récupérer le token dans une variable
    def token = ""
    withCredentials([string(credentialsId: credentialsId, variable: 'DH_TOKEN')]) {
        token = env.DH_TOKEN
    }

    // Étape 2 : Login et push avec le token en clair
    echo "🔑 Connexion à Docker Hub..."
    sh "echo '${token}' | docker login docker.io -u arijbelaid --password-stdin"
    
    echo "🚀 Push de l'image Docker : ${fullImageName}"
    sh "docker push ${fullImageName}"
}
