import React from 'react';
import { AlertOctagon, Trophy, AlertTriangle } from 'lucide-react';
import '../styles/DriverRanking.css';

function DriverRanking({ ranking }) {
  return (
    <div className="driver-ranking">
      <h2>
        <AlertOctagon size={20} color="#ff4b4b" />
        KURAL İHLALİ SIRALAMASI (EN ÇOK BİLDİRİM ALANLAR)
      </h2>
      <div className="ranking-list">
        {ranking && ranking.length > 0 ? (
          ranking.map((driver, index) => (
            <div key={index} className={`ranking-item rank-${index + 1}`}>
              <div className="rank-number">
                {index === 0 ? <Trophy size={18} color="#ffd700" /> : 
                 index === 1 ? <Trophy size={18} color="#c0c0c0" /> : 
                 index === 2 ? <Trophy size={18} color="#cd7f32" /> : 
                 `#${index + 1}`}
              </div>
              <div className="driver-name">{driver.driverName}</div>
              <div className="penalty-score">
                <AlertTriangle size={14} />
                <span>{driver.penaltyCount} İhlal</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-violations">
            <p>Harika! Hiçbir sürücünüz kural ihlali bildirimi almadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverRanking;
