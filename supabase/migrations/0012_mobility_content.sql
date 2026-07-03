-- ============================================================
-- Contenuti Mobilità / Stretching (6 contesti, PRIMA=pre, DOPO=post)
-- Aggiunge la colonna priorita e popola tutte le voci.
-- Rieseguibile: svuota e ricarica la sezione mobilità (non tocca altro).
-- Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

alter table mobility_exercise add column if not exists youtube_term text;
alter table mobility_exercise add column if not exists priorita text;

delete from mobility_exercise;

insert into mobility_exercise (context, phase, order_index, name, prescription, youtube_term, priorita) values
-- GENERICO — PRE
('generico','pre',1,'Cat-cow','8-10 cicli','cat cow exercise tutorial','Essenziale'),
('generico','pre',2,'Open book','6-8/lato','open book thoracic rotation stretch','Essenziale'),
('generico','pre',3,'World''s greatest stretch','5/lato','world''s greatest stretch tutorial','Essenziale'),
('generico','pre',4,'90/90 hip switch','8/lato','90 90 hip switch tutorial','Utile'),
('generico','pre',5,'Pass-through con bastone','8-10','shoulder pass through stick mobility','Utile'),
-- GENERICO — POST
('generico','post',1,'Upper trap + levator stretch (mento retratto)','30"/lato','upper trapezius and levator scapulae stretch','Essenziale'),
('generico','post',2,'Doorway pec stretch','30"/lato','doorway chest stretch tutorial','Essenziale'),
('generico','post',3,'Couch stretch','30-45"/lato','couch stretch tutorial','Utile'),
('generico','post',4,'Sleeper stretch','30"/lato','sleeper stretch physical therapy tutorial','Utile'),
('generico','post',5,'Knee-to-wall','10/lato','knee to wall ankle mobility','Utile'),

-- CORSA — PRE
('corsa','pre',1,'Dynamic Ankle Lunge (WBLT)','12-15/lato','weight bearing lunge test dynamic ankle mobility','Essenziale'),
('corsa','pre',2,'Dynamic Half-Kneeling Hip Flexor','10-12/lato','dynamic half kneeling hip flexor stretch posterior pelvic tilt','Essenziale'),
('corsa','pre',3,'Banded Glute Bridge','15 (hold 1")','banded glute bridge tutorial','Essenziale'),
('corsa','pre',4,'Banded Lateral Walk','15 passi/lato','banded lateral walks exercise cues','Utile'),
('corsa','pre',5,'Archer''s Rotation (mento retratto)','8-10/lato','archers rotation thoracic mobility','Essenziale'),
('corsa','pre',6,'Progressive Strides (allunghi)','3-4','running strides warm up technique','Essenziale'),
-- CORSA — POST
('corsa','post',1,'Standing Calf Stretch','2×45"/lato','standing calf stretch gastrocnemius and soleus','Essenziale'),
('corsa','post',2,'Half-Kneeling Hip Flexor (statico)','2×45"/lato','half kneeling hip flexor stretch with arms raised','Essenziale'),
('corsa','post',3,'Couch Stretch','2×45"/lato','couch stretch rectus femoris pain relief','Utile'),
('corsa','post',4,'Supine Hamstring Stretch','2×45"/lato','supine hamstring stretch with strap','Utile'),
('corsa','post',5,'Pigeon Pose','2×45"/lato','pigeon pose stretch physical therapy','Utile'),
('corsa','post',6,'Standing QL Stretch','2×45"/lato','standing quadratus lumborum stretch','Utile'),

-- CALCETTO (calcio) — PRE
('calcio','pre',1,'Mobilizzazione talo-crurale con bastone','10/lato (hold 2")','ankle dorsiflexion drill with stick','Essenziale'),
('calcio','pre',2,'Distrazione talo-crurale con elastico','15/lato','banded ankle dorsiflexion mobilization','Essenziale'),
('calcio','pre',3,'Spiderman plank con rotazione toracica','6/lato (hold 2")','world''s greatest stretch tutorial','Essenziale'),
('calcio','pre',4,'FIFA 11+ Hip Out / Hip In','2 serie/direzione su 10 m','fifa 11 plus hip out','Essenziale'),
('calcio','pre',5,'Copenhagen Plank liv.1','2×15"/lato','copenhagen plank progression','Essenziale'),
('calcio','pre',6,'Lateral Slow Skaters','10 salti alternati','skater jumps landing stability','Essenziale'),
('calcio','pre',7,'Plant and Cut','4/lato','fifa 11 plus plant and cut','Utile'),
('calcio','pre',8,'Corsa e contatto di spalla','2×6/lato','fifa 11 plus shoulder contact','Utile'),
('calcio','pre',9,'Single-Leg Balance con torsione','30"/gamba','single leg balance with trunk rotation','Utile'),
-- CALCETTO (calcio) — POST
('calcio','post',1,'Couch Stretch','2×30"-1''/lato','couch stretch tutorial','Essenziale'),
('calcio','post',2,'Frog Stretch','1-2×1''','frog stretch adductor mobility','Essenziale'),
('calcio','post',3,'Ischiocrurali a spina neutra','2×30"-1''/lato','static hamstring stretch neutral spine','Essenziale'),
('calcio','post',4,'Polpaccio – soleo','45"/gamba','wall soleus stretch','Essenziale'),
('calcio','post',5,'Polpaccio – gastrocnemio','45"/gamba','wall gastrocnemius stretch','Essenziale'),
('calcio','post',6,'Ischiocrurali supino','1''/lato','supine hamstring stretch with strap','Utile'),
('calcio','post',7,'Figure-Four supino','2×45"/lato','figure four stretch glute','Utile'),

-- PALESTRA A — PRE
('A','pre',1,'Wrist Rocks','1''-1''30"','wrist rocks mobility tutorial','Essenziale'),
('A','pre',2,'Scapular Push-Up','15 reps','scapular push up tutorial','Essenziale'),
('A','pre',3,'Seated Wall Angels con chin tuck','12 reps','seated wall angels tutorial','Essenziale'),
('A','pre',4,'Spiderman Lunge con T-rotation','8/lato','spiderman stretch with thoracic rotation','Essenziale'),
('A','pre',5,'Banded Ankle Dorsiflexion','45"/lato','banded ankle dorsiflexion mobilization','Essenziale'),
('A','pre',6,'Kettlebell Good Morning','12 reps','kettlebell good morning tutorial','Utile'),
-- PALESTRA A — POST
('A','post',1,'Couch Stretch','1''-1''30"/lato','couch stretch kelly starrett','Essenziale'),
('A','post',2,'Pigeon Pose','45"-1''/lato','pigeon pose stretch tutorial','Essenziale'),
('A','post',3,'Bretzel Stretch','1''/lato','bretzel stretch tutorial','Essenziale'),
('A','post',4,'Doorway Chest Stretch','1''-1''30"','doorway chest stretch tutorial','Utile'),
('A','post',5,'Kneeling Wrist Flexor Stretch','1''-1''30"','kneeling wrist flexor stretch','Utile'),

-- PALESTRA B — PRE
('B','pre',1,'Estensione toracica su foam roller','12-15','foam roller thoracic extension tutorial','Essenziale'),
('B','pre',2,'Scapula Push-up Plus con elastico','12-15','scapular push up plus band','Essenziale'),
('B','pre',3,'Banded 2-Step External Rotation','12-15 (hold 3")','2 step band external rotation shoulder','Essenziale'),
('B','pre',4,'Cervical Retraction (mento retratto)','12-15 (hold 2")','cervical retraction exercise chin tuck','Essenziale'),
('B','pre',5,'Thread the Needle dinamico','8-10/lato','thread the needle stretch dynamic','Utile'),
('B','pre',6,'Band Cheerleader Series (T''s & Diagonals)','10','cheerleader diagonals band exercise','Utile'),
('B','pre',7,'Cervical Retraction iso-resistenza','10 (hold 5")','manual cervical resistance chin tuck','Utile'),
-- PALESTRA B — POST
('B','post',1,'Allungamento dorsali a 4 zampe (thumb-up)','30-45"/lato','lat stretch on all fours thumb up','Essenziale'),
('B','post',2,'Pettorali alla porta (mento retratto)','30-45"/lato','doorway pectoral stretch chin tuck','Essenziale'),
('B','post',3,'Sleeper Stretch','30-45"/lato','sleeper stretch physical therapy tutorial','Essenziale'),
('B','post',4,'Trapezio sup. & elevatore (mento retratto)','30-45"/lato','upper trapezius and levator scapulae stretch','Essenziale'),
('B','post',5,'Foam roll dorsali','1''30"/lato','foam roll latissimus dorsi tutorial','Utile'),
('B','post',6,'Flessori avambraccio','30-45"','forearm flexor stretch on knees','Utile'),

-- PALESTRA C — PRE
('C','pre',1,'Mobilità caviglia Knee-to-Wall','10-12/lato','knee to wall ankle mobility stretch','Essenziale'),
('C','pre',2,'90/90 Hip Switch dinamico','8/lato','90 90 hip switch tutorial','Essenziale'),
('C','pre',3,'Rotazione toracica Lumbar-Locked','8-10/lato','quadruped lumbar locked thoracic rotation','Essenziale'),
('C','pre',4,'Single-Leg Airplane','6-8/lato','single leg airplane exercise cues','Essenziale'),
('C','pre',5,'Dynamic Hip Flexor Stretch','10/lato','dynamic half kneeling hip flexor stretch','Utile'),
('C','pre',6,'Single-Leg Balance Compass Touch','3 circuiti/gamba','star excursion balance test dynamic warm up','Utile'),
-- PALESTRA C — POST
('C','post',1,'Couch Stretch statico','60-90"/lato','couch stretch tutorial physical therapy','Essenziale'),
('C','post',2,'Frog Stretch statico','90-120"','frog stretch adductors tutorial','Essenziale'),
('C','post',3,'Supine Figure-Four','45-60"/lato','supine figure four stretch glutes','Essenziale'),
('C','post',4,'Estensione toracica su foam roller','60-90"','thoracic extension on foam roller','Utile'),
('C','post',5,'Calf Stretch alla parete','45-60"/lato','standing calf stretch wall','Utile');
