<?php
/**
 * La pulizia dei messaggi: sei mesi dall'ultimo scambio, poi si cancellano.
 *
 * La privacy policy lo dichiara, quindi il codice lo fa. Una promessa scritta
 * in una pagina e non eseguita da nessuno è peggio di nessuna promessa.
 *
 * **Sei mesi da quando?** Dall'ULTIMA attività della conversazione: il
 * messaggio di partenza o, se c'è, l'ultima risposta di chi ha scritto o di
 * Simone. Una conversazione ancora viva non si cancella perché è cominciata
 * sette mesi fa. Si cancella per intero, messaggio e risposte insieme.
 *
 * **Chi la fa partire.** Il sito non ha un cron, e una pulizia che dipende da
 * qualcuno che ricorda di lanciarla non è una garanzia. Parte da sola, al
 * massimo una volta al giorno, da quattro punti: il pannello (ogni volta che si
 * apre), il modulo dei contatti, la pagina /messaggio e la registrazione di
 * una visita a un articolo. L'ultima è quella che la rende affidabile: finché il
 * sito ha lettori, la pulizia gira. Costa una SELECT su una tabella di poche
 * righe, e un file vuoto nella cartella temporanea che dice «oggi l'ho già
 * fatta».
 *
 * Questo file non richiede altro di proposito: lo carica anche
 * api/analytics.php a ogni visita, e non deve portarsi dietro PHPMailer.
 */

declare(strict_types=1);

const MESSAGGI_CONSERVAZIONE_MESI = 6;

/**
 * Cancella le conversazioni ferme da più di sei mesi.
 *
 * @param bool $sempre  ignora il «l'ho già fatta oggi» (le prove, e chi la chiama
 *                      a mano)
 * @return int quante conversazioni ha cancellato
 */
function messaggi_pulizia(PDO $db, bool $sempre = false): int {
    if (!$sempre) {
        $marca = sys_get_temp_dir() . '/sp_messaggi_pulizia_' . date('Ymd');
        if (is_file($marca)) return 0;
        @touch($marca);
    }

    $limite = date('Y-m-d H:i:s', strtotime('-' . MESSAGGI_CONSERVAZIONE_MESI . ' months'));

    try {
        try {
            $st = $db->prepare("SELECT m.id FROM messages m
                                WHERE m.created_at < ?
                                  AND NOT EXISTS (SELECT 1 FROM message_replies r
                                                  WHERE r.message_id = m.id AND r.sent_at >= ?)");
            $st->execute([$limite, $limite]);
        } catch (Throwable $e) {
            // Prima della migrazione la tabella delle risposte non c'è: contano solo i messaggi.
            $st = $db->prepare("SELECT id FROM messages WHERE created_at < ?");
            $st->execute([$limite]);
        }
        $ids = array_map('intval', $st->fetchAll(PDO::FETCH_COLUMN));
        $st->closeCursor();

        foreach (array_chunk($ids, 100) as $gruppo) {
            $segni = implode(',', array_fill(0, count($gruppo), '?'));
            try { $db->prepare("DELETE FROM message_replies WHERE message_id IN ($segni)")->execute($gruppo); }
            catch (Throwable $e) { /* niente tabella delle risposte, niente da cancellare */ }
            $db->prepare("DELETE FROM messages WHERE id IN ($segni)")->execute($gruppo);
        }

        // Risposte rimaste senza il loro messaggio (un messaggio cancellato a mano da altrove).
        try { $db->exec("DELETE FROM message_replies WHERE message_id NOT IN (SELECT id FROM messages)"); }
        catch (Throwable $e) { /* come sopra */ }
    } catch (Throwable $e) {
        error_log('messaggi_pulizia: ' . $e->getMessage());
        return 0;
    }

    if ($ids) error_log('messaggi_pulizia: cancellate ' . count($ids) . ' conversazioni ferme da oltre '
        . MESSAGGI_CONSERVAZIONE_MESI . ' mesi');
    return count($ids);
}
