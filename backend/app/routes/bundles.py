from fastapi import APIRouter, Depends, HTTPException
from app.services.bundle import BundleService
from app.dependencies import get_bundle_service

router = APIRouter(prefix="/bundles", tags=["bundles"])


@router.get("/")
def list_bundles(svc: BundleService = Depends(get_bundle_service)):
    return svc.list_all()


@router.get("/{bundle_id}")
def get_bundle(bundle_id: int, svc: BundleService = Depends(get_bundle_service)):
    try:
        return svc.get(bundle_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
