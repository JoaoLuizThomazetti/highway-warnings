#!/bin/bash

uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
serve -s frontend/dist -l tcp://0.0.0.0:3103