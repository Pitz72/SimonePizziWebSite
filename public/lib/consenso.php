<?php
/**
 * Il consenso alla newsletter, in un file che si carica ovunque: lo legge il
 * modulo sul sito e lo registra la libreria, e i due devono dire la stessa cosa.
 *
 * Una prova che riporta un testo diverso da quello letto non prova niente: se
 * si tocca questo testo, si alza anche la versione. La versione è quella
 * dell'informativa privacy, e serve a sapere quale informativa ha letto chi si
 * è iscritto.
 */

declare(strict_types=1);

const NEWSLETTER_CONSENSO_TESTO = "Ho letto l’informativa privacy e acconsento a ricevere via email la newsletter di Simone Pizzi. Dichiaro di avere almeno 14 anni. Posso revocare il consenso in qualsiasi momento dal link presente in ogni messaggio.";
const NEWSLETTER_CONSENSO_VERSIONE = '2026-10';
