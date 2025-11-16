#!/bin/bash
# Node wrapper that always includes --openssl-legacy-provider flag
exec "$(command -v node)" --openssl-legacy-provider "$@"


