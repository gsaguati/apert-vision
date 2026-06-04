"""Datos demo para el prototipo. Se reemplaza con Firebase en producción."""

CLUB_NAME = "Los Pumas RC"

MATCHES = [
    {
        "id": 1, "team_local": "Los Pumas RC", "team_visit": "Córdoba Bears",
        "date": "01/06/2026", "competition": "Super Rugby Doméstico",
        "score_local": 34, "score_visit": 21, "result": "W",
        "lineouts": 14, "scrums": 6, "kickoffs": 3,
        "possession_local": 58, "avg_confidence": 94.8,
        "duration_min": 80, "analyzed": True, "output_path": "",
        "events": [
            {"type":"lineout","label":"Line-out","time_str":"02:14","second":134,"confidence":0.97,"team":"Local"},
            {"type":"scrum",  "label":"Scrum",   "time_str":"07:41","second":461,"confidence":0.94,"team":"Visitante"},
            {"type":"lineout","label":"Line-out","time_str":"12:08","second":728,"confidence":0.99,"team":"Local"},
            {"type":"kickoff","label":"Salida 22","time_str":"18:33","second":1113,"confidence":0.91,"team":"Local"},
            {"type":"lineout","label":"Line-out","time_str":"24:55","second":1495,"confidence":0.96,"team":"Visitante"},
            {"type":"scrum",  "label":"Scrum",   "time_str":"31:17","second":1877,"confidence":0.93,"team":"Local"},
            {"type":"lineout","label":"Line-out","time_str":"38:02","second":2282,"confidence":0.98,"team":"Local"},
            {"type":"lineout","label":"Line-out","time_str":"44:30","second":2670,"confidence":0.95,"team":"Visitante"},
            {"type":"scrum",  "label":"Scrum",   "time_str":"51:09","second":3069,"confidence":0.92,"team":"Local"},
            {"type":"lineout","label":"Line-out","time_str":"57:44","second":3464,"confidence":0.97,"team":"Local"},
            {"type":"kickoff","label":"Salida 22","time_str":"63:22","second":3802,"confidence":0.89,"team":"Visitante"},
            {"type":"lineout","label":"Line-out","time_str":"69:15","second":4155,"confidence":0.96,"team":"Local"},
            {"type":"scrum",  "label":"Scrum",   "time_str":"74:50","second":4490,"confidence":0.94,"team":"Visitante"},
            {"type":"lineout","label":"Line-out","time_str":"78:33","second":4713,"confidence":0.99,"team":"Local"},
        ],
        "possession_series": [52,55,58,60,57,55,59,62,60,58,56,58,60,61,58,59],
    },
    {
        "id": 2, "team_local": "Los Pumas RC", "team_visit": "Rosario Lions",
        "date": "25/05/2026", "competition": "Super Rugby Doméstico",
        "score_local": 18, "score_visit": 27, "result": "L",
        "lineouts": 11, "scrums": 8, "kickoffs": 4,
        "possession_local": 44, "avg_confidence": 93.2,
        "duration_min": 80, "analyzed": True, "output_path": "",
        "events": [],
        "possession_series": [48,45,43,40,42,44,41,39,42,44,43,45,44,43,44,44],
    },
    {
        "id": 3, "team_local": "Los Pumas RC", "team_visit": "BA Sharks",
        "date": "18/05/2026", "competition": "Copa Argentina",
        "score_local": 41, "score_visit": 14, "result": "W",
        "lineouts": 17, "scrums": 5, "kickoffs": 2,
        "possession_local": 62, "avg_confidence": 95.1,
        "duration_min": 80, "analyzed": True, "output_path": "",
        "events": [],
        "possession_series": [58,60,63,65,62,61,64,66,63,61,62,64,63,62,61,62],
    },
    {
        "id": 4, "team_local": "Los Pumas RC", "team_visit": "Tucumán Cóndors",
        "date": "11/05/2026", "competition": "Copa Argentina",
        "score_local": 29, "score_visit": 22, "result": "W",
        "lineouts": 0, "scrums": 0, "kickoffs": 0,
        "possession_local": 0, "avg_confidence": 0,
        "duration_min": 80, "analyzed": False, "output_path": "",
        "events": [], "possession_series": [],
    },
    {
        "id": 5, "team_local": "Los Pumas RC", "team_visit": "Mendoza Cóndors",
        "date": "04/05/2026", "competition": "Super Rugby Doméstico",
        "score_local": 20, "score_visit": 20, "result": "D",
        "lineouts": 0, "scrums": 0, "kickoffs": 0,
        "possession_local": 0, "avg_confidence": 0,
        "duration_min": 80, "analyzed": False, "output_path": "",
        "events": [], "possession_series": [],
    },
]

PLAYERS = [
    {"id":1,"name":"Marcos Fernández","initials":"MF","position":"Pilier",      "age":26,"matches":18,"lineouts":42},
    {"id":2,"name":"Santiago López",  "initials":"SL","position":"Hooker",      "age":24,"matches":22,"lineouts":67},
    {"id":3,"name":"Rodrigo Pérez",   "initials":"RP","position":"Pilier",      "age":29,"matches":15,"lineouts":31},
    {"id":4,"name":"Lucas Martínez",  "initials":"LM","position":"Lock",        "age":27,"matches":21,"lineouts":88},
    {"id":5,"name":"Agustín Díaz",    "initials":"AD","position":"Lock",        "age":25,"matches":20,"lineouts":74},
    {"id":6,"name":"Pablo García",    "initials":"PG","position":"Flanker",     "age":23,"matches":17,"lineouts":19},
    {"id":7,"name":"Ezequiel Torres", "initials":"ET","position":"Flanker",     "age":28,"matches":24,"lineouts":22},
    {"id":8,"name":"Nicolás Ruiz",    "initials":"NR","position":"Nº 8",        "age":26,"matches":23,"lineouts":15},
    {"id":9,"name":"Facundo Sosa",    "initials":"FS","position":"Medio Scrum", "age":22,"matches":19,"lineouts":5},
    {"id":10,"name":"Tomás Herrera",  "initials":"TH","position":"Apertura",    "age":24,"matches":21,"lineouts":3},
]

POSITIONS = ["Todos","Pilier","Hooker","Lock","Flanker","Nº 8","Medio Scrum","Apertura"]

def get_global_stats():
    analyzed = [m for m in MATCHES if m["analyzed"]]
    total_lo  = sum(m["lineouts"]  for m in analyzed)
    total_sc  = sum(m["scrums"]    for m in analyzed)
    total_ko  = sum(m["kickoffs"]  for m in analyzed)
    avg_poss  = (sum(m["possession_local"] for m in analyzed) / len(analyzed)) if analyzed else 0
    avg_conf  = (sum(m["avg_confidence"]   for m in analyzed) / len(analyzed)) if analyzed else 0
    total_h   = sum(m["duration_min"] for m in analyzed) // 60
    wins      = sum(1 for m in MATCHES if m["result"] == "W")
    losses    = sum(1 for m in MATCHES if m["result"] == "L")
    draws     = sum(1 for m in MATCHES if m["result"] == "D")
    return {
        "total_matches": len(analyzed),
        "total_lineouts": total_lo,
        "total_scrums": total_sc,
        "total_kickoffs": total_ko,
        "avg_possession": avg_poss,
        "avg_confidence": avg_conf,
        "total_hours": total_h,
        "wins": wins, "losses": losses, "draws": draws,
    }
