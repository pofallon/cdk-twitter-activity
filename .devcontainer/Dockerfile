FROM jsii/superchain

WORKDIR /tmp
RUN pip3 uninstall --yes awscli \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws \
    && curl -sL https://rpm.nodesource.com/setup_12.x | bash - \
    && yum update -y \
    && yum install -y nodejs jq \
    && yum clean all \
    && npm install -g npm-check-updates \
    && npm install -g aws-cdk \
    && curl "https://gist.githubusercontent.com/pofallon/f0295efebfa51aed54e34d04ca521574/raw/48614a61025752c21571b5b498e8ae399d3a296d/awsso.sh" -o "/root/awsso.sh" \
    && chmod u+x /root/awsso.sh