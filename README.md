# ssh-explorer
This is the demo program.
The purpose is to display the directories and files on a remote node connected via SSH.
This was 80% created by Gemini CLI, with the remaining 20% created by me.

## download from git repository
```
cd $HOME
git clone git@github.com:hidekuno/ssh-explorer
```

## backend

If uv is not installed, please execute the following command example:
```
curl -LsSf https://astral.sh/uv/install.sh | sh
or
cargo install --git https://github.com/astral-sh/uv uv
```

If python is not installed, please execute the following command example:
```
uv python install 3.13
```

install & run
```
cd ~/ssh-explorer/frontend/
uv sync --frozen --no-cache
uv run uvicorn main:app --port=8000
  or
  uv run uvicorn main:app --port=8000 --reload
```

docker build & run
```
docker build -t ssh-explorer:latest .
docker run -d -p 18000:8000 --name ssh-explorer ssh-explorer:latest
```

## frontend
install & run
```
cd ~/ssh-explorer/frontend/
npm install
npm run dev
```

input http://localhost:5173/ on browser

<img width="30%" height="30%" alt="Image" src="https://github.com/user-attachments/assets/2fd5af7a-4780-41ff-970a-3729ba3c46b2" />

input connection information, click connect button

<img width="30%" height="30%" alt="Image" src="https://github.com/user-attachments/assets/e627ffa2-512b-472f-bd53-3c1d0757c7eb" />

lint & build
```
npm run lint
npm run build
```
