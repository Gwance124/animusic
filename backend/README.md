# create a virtual env
$ python3 -m venv .venv 

# activate the environment
$ source .venv/bin/activate

# install the dependencies
$ pip install --editable .

# build to create an executable cli under bin
$ pip install --target=. --no-deps .

# run the cli
$ bin/song_importer -e ../frontend/.env 
