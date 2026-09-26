import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_and_login():
    response = client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

    response = client.post(
        "/auth/login",
        json={
            "username": "testuser",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data


def test_project_crud_and_ownership():
    # Register user 1
    client.post(
        "/auth/register",
        json={
            "username": "user1",
            "email": "user1@example.com",
            "password": "password123",
        },
    )
    login_res = client.post(
        "/auth/login",
        json={
            "username": "user1",
            "password": "password123",
        },
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create project
    proj_res = client.post(
        "/projects",
        headers=headers,
        json={
            "name": "Project Alpha",
            "description": "Test description",
            "status": "active",
            "priority": 1,
        },
    )
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # Get projects
    list_res = client.get("/projects", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # Register user 2 and verify isolation
    client.post(
        "/auth/register",
        json={
            "username": "user2",
            "email": "user2@example.com",
            "password": "password123",
        },
    )
    login2 = client.post(
        "/auth/login",
        json={
            "username": "user2",
            "password": "password123",
        },
    )
    headers2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    # User 2 cannot see User 1's project
    list2_res = client.get("/projects", headers=headers2)
    assert list2_res.status_code == 200
    assert len(list2_res.json()) == 0

    # User 2 cannot get User 1's project by ID (returns 403 Forbidden)
    get2_res = client.get(f"/projects/{proj_id}", headers=headers2)
    assert get2_res.status_code == 403
