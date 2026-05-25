Das Problem ist die Migrationsreihenfolge: 002-load-fake-data.yaml läuft vor 003-add-page-section.yaml, das die page_id-Spalte erst erstellt. Die Lösung: page_id im CSV behalten, aber in 002 als skip markieren und danach per
UPDATE in 004 setzen (wenn die Pages bereits geladen sind).

● Update(src/main/resources/db/changelog/webcontent/002-load-fake-data.yaml)
⎿  Added 4 lines, removed 4 lines
66                    type: skip
67                - column:
68                    name: page_id
69 -                  type: numeric                                                                                                                                                                                    
69 +                  type: skip   