from sqlalchemy import create_engine

DB_USER = "root"
DB_PASSWORD = "Dwarika@2004"
DB_HOST = "localhost"
DB_NAME = "farmer_market"

engine = create_engine(
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
)

print("Database Connected Successfully")