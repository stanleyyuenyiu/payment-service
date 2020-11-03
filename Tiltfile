allow_k8s_contexts('dev.cluster.kops.k8s.local')

docker_build('274709190364.dkr.ecr.ap-southeast-1.amazonaws.com/member',
    context='.',
    dockerfile='Dockerfile',
    build_args={'node_env': 'development'},
    entrypoint='./node_modules/.bin/nodemon src/server.js',
    live_update=[
        # Map the local source code into the container under /opt/src
        sync('src', '/opt/src'),
    ])
    
k8s_yaml('build/uat/member-deployment.yaml')
