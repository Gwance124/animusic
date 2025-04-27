# create a virtual env.
$ python3 -m venv .venv 

# activate the environment
$ source .venv/bin/activate

# install the dependencies. editable mode is used to install the package in a way that allows you to modify the code without reinstalling it.
$ pip install --editable .

# you can check the installed packages in the virtual environment.
$ pip list
Package            Version     Editable project location
------------------ ----------- ----------------------------------------
aiohappyeyeballs   2.6.1
aiohttp            3.11.18
aiosignal          1.3.2
annotated-types    0.7.0
anyio              4.9.0
attrs              25.3.0
backend_package    0.1.0       /home/hwansoo/workspace/animusic/backend
....

# run the cli. As the package is installed in editable mode, you can run the cli directly.
$ song_importer -e ../frontend/.env 

# check if bin directory of the virtual environment is in the PATH.
$ echo $PATH | tr ':' '\n'
/home/hwansoo/workspace/animusic/backend/.venv/bin
/home/hwansoo/.nvm/versions/node/v14.17.3/bin
/home/hwansoo/.npm-packages/bin
...