import os
import sys

# Ensure the backend root is importable so `from app...` works under pytest.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
