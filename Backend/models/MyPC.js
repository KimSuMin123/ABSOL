module.exports = (sequelize, DataTypes) => {
  return sequelize.define('MyPC', {
    mypc_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pc_nickname: { type: DataTypes.STRING, defaultValue: '내 컴퓨터' }, // 식별용 이름
    
    // CPU
    cpu_name: { type: DataTypes.STRING },
    cpu_sn: { type: DataTypes.STRING },
    cpu_warranty: { type: DataTypes.BOOLEAN },

    // CPU 쿨러
    cooler_name: { type: DataTypes.STRING },
    cooler_sn: { type: DataTypes.STRING },
    cooler_warranty: { type: DataTypes.BOOLEAN },

    // 메인보드 (M/B)
    mb_name: { type: DataTypes.STRING },
    mb_sn: { type: DataTypes.STRING },
    mb_warranty: { type: DataTypes.BOOLEAN },

    // 메모리 (RAM)
    ram_name: { type: DataTypes.STRING },
    ram_sn: { type: DataTypes.STRING },
    ram_warranty: { type: DataTypes.BOOLEAN },

    // 그래픽카드 (VGA)
    vga_name: { type: DataTypes.STRING },
    vga_sn: { type: DataTypes.STRING },
    vga_warranty: { type: DataTypes.BOOLEAN },

    // 파워 (P/S)
    ps_name: { type: DataTypes.STRING },
    ps_sn: { type: DataTypes.STRING },
    ps_warranty: { type: DataTypes.BOOLEAN },

    // 저장장치 (Storage 0, 1, 2)
    storage0_name: { type: DataTypes.STRING },
    storage0_sn: { type: DataTypes.STRING },
    storage0_warranty: { type: DataTypes.BOOLEAN },
    
    storage1_name: { type: DataTypes.STRING },
    storage1_sn: { type: DataTypes.STRING },
    storage1_warranty: { type: DataTypes.BOOLEAN },

    storage2_name: { type: DataTypes.STRING },
    storage2_sn: { type: DataTypes.STRING },
    storage2_warranty: { type: DataTypes.BOOLEAN },

    // 케이스 및 기타
    case_name: { type: DataTypes.STRING },
    case_sn: { type: DataTypes.STRING },
    case_warranty: { type: DataTypes.BOOLEAN },

    etc_name: { type: DataTypes.STRING },
    etc_sn: { type: DataTypes.STRING },
    etc_warranty: { type: DataTypes.BOOLEAN },
  });
};