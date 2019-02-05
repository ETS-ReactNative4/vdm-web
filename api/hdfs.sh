#!/bin/bash
#hadoop fs -ls vdm/scripts
hadoop fs -copyFromLocal /opt/rcg/vdm-http/vdm-web/api/public/files/cli/script.cli /user/cloudera-service/vdm/scripts
#hadoop fs -ls vdm/scripts
