from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the FutureHive Backend!"}

@app.get("/api")
def read_api():
    return {"message": "This is the API endpoint."}