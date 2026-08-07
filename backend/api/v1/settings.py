from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.database.session import get_db
from backend.models.domain import Setting, User
from backend.schemas.domain import SettingUpdate
from backend.api.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings & Config"])

@router.get("")
async def get_settings(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Setting).where(Setting.user_id == user.id))
    records = list(res.scalars().all())
    default_settings = {
        "default_strategy": "dynamic",
        "gemini_enabled": True,
        "openai_enabled": True,
        "ollama_enabled": True,
        "human_approval_required": False
    }
    for r in records:
        default_settings[r.setting_key] = r.setting_value
    return default_settings

@router.post("")
async def update_setting(data: SettingUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Setting).where(Setting.user_id == user.id, Setting.setting_key == data.setting_key))
    existing = res.scalar_one_or_none()
    if existing:
        existing.setting_value = data.setting_value
    else:
        new_set = Setting(user_id=user.id, setting_key=data.setting_key, setting_value=data.setting_value)
        db.add(new_set)
    await db.commit()
    return {"status": "success", "key": data.setting_key, "value": data.setting_value}
