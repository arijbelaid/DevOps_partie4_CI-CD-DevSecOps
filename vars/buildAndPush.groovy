def call(Map config = [:]) {
    def imageName = config.imageName ?: 'contact-api'
    def tag = config.tag ?: 'latest'
    def registry = config.registry ?: 'docker.io/arjbelaid'
    def credentialsId = config.credentialsId ?: 'dockerhub-token-secret'
    
    def fullImageName = "${registry}/${imageName}:${tag}"

    echo "🐳 Construction de l'image Docker : ${fullImageName}"
    sh "docker build -t ${fullImageName} ."

    withCredentials([string(credentialsId: credentialsId, variable: 'DH_TOKEN')]) {
        echo "🔑 Connexion à Docker Hub..."
        sh 'echo "$DH_TOKEN" | docker login docker.io -u arijbelaid --password-stdin'
        
        // PAUSE CRUCIALE : laisser Docker Hub valider la session
        sleep 5
        
        echo "🚀 Push de l'image Docker : ${fullImageName}"
        sh "docker push ${fullImageName}"
    }
}
