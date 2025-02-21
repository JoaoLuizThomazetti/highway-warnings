import math
import geopandas as gpd
from shapely.geometry import Point
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from shapely.geometry import Point, LineString

app = FastAPI()

highways_gdf = gpd.read_file("backend/SC-highways.geojson")
highways_gdf = highways_gdf.to_crs(epsg=32723)
dissolved_highways = highways_gdf.dissolve(by="name")

origins = [
    "http://localhost:3103",
    "http://127.0.0.1:3103",
    "http://0.0.0.0:3103",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # origins,
    allow_credentials=False,  # True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/nearest_state_highway")
async def get_nearest_state_highway(lat: float = Query(...), lng: float = Query(...)):
    clicked_point = Point(lng, lat)
    clicked_point_proj = gpd.GeoSeries([clicked_point], crs="EPSG:4326").to_crs(dissolved_highways.crs).iloc[0]

    dissolved_highways["distance"] = dissolved_highways.geometry.apply(lambda geom: clicked_point_proj.distance(geom))
    nearest_highway = dissolved_highways.loc[dissolved_highways["distance"].idxmin()]
    highway_ref = nearest_highway.ref
    highway_name = nearest_highway.name

    # TODO IMPLEMENT ON FRONT TO DISCOVER THE NEAREST COORD OF THE CLICKED POINT

    # highway_geom = nearest_highway.geometry
    # distance_along = highway_geom.project(clicked_point_proj)
    # km_distance = distance_along / 1000.0
    # nearest_km = round(km_distance)
    # snapped_point = highway_geom.interpolate(distance_along)
    # snapped_point_wgs84 = gpd.GeoSeries([snapped_point], crs=dissolved_highways.crs).to_crs(epsg=4326).iloc[0]
    # snapped_lng, snapped_lat = snapped_point_wgs84.x, snapped_point_wgs84.y

    return {"highway": highway_ref, "name": highway_name}
