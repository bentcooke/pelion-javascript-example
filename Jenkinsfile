pipeline {
    agent {
        dockerfile {
            args '-v jenkins-data:/root'
            label 'master'
        }
    }
    environment {
        PELION_CONFIG_PATH = credentials('${pelion-config}')
        TERM='xterm'
    }
    stages {
        stage('Build') {
            steps {
                sh '''
                    npm i
                    node jenkins/check_alive.js
                    ssh -tt admin@10.118.81.142 top -b -n 1 > stats.log
                    '''
            }
        }
    }
    post {
        success {
            archiveArtifacts artifacts: 'stats.log', fingerprint: true
        }
    }
}