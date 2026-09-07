<?php
/**
 * Le rotte del sito, e i due testi che una persona legge su Google prima di
 * decidere se entrare.
 *
 * Stanno in un file loro, come nel Festival, per una ragione precisa: questi
 * testi li rilegge e li corregge Simone, e devono essere in un posto solo. Una
 * description composta da una formula («Esplora tutti gli articoli nella
 * sezione X») non dice niente che il titolo non abbia già detto: è quello che
 * fa oggi index.php per le categorie, ed è il motivo per cui quelle pagine su
 * Google sembrano tutte uguali.
 *
 * Misure: il titolo sta sotto i 60 caratteri, la descrizione fra 120 e 158.
 * Sono le soglie del verificatore SEO, le stesse sui tre siti.
 *
 * Aggiungere una pagina fissa resta una riga qui dentro. Le rotte con un
 * segnaposto (categorie, articoli, tag) prendono i testi dal database: le
 * trova il front controller, non questa tabella.
 */

declare(strict_types=1);

return [

    '' => [
        'pagina' => 'home',
        'title'  => 'Simone Pizzi — creazioni ibride',
        'desc'   => 'Videogiochi, racconti, software e radio: i progetti di Simone Pizzi e i devlog che raccontano come sono fatti davvero, dal 2010 a oggi.',
    ],

    'tutti-i-progetti' => [
        'pagina'  => 'progetti',
        'briciola' => 'Tutti i progetti',
        'title'   => 'Tutti i progetti — Simone Pizzi',
        'desc'    => 'Diciotto lavori fra videogiochi, motori narrativi, software per la radio e libri. Quasi tutti finiti su GitHub, quasi sempre dopo aver provato a venderli.',
    ],

    'contatti' => [
        'pagina'  => 'contatti',
        'briciola' => 'Contatti',
        'title'   => 'Contatti — Simone Pizzi',
        'desc'    => 'Scrivere a Simone Pizzi per collaborazioni, domande sui progetti, segnalazioni di errori nei giochi o per raccontare che qualcosa non funziona.',
    ],

    /* Le due pagine di esito della newsletter esistono per chi arriva dal link
       nella email. Non hanno niente da offrire a un motore di ricerca, e una
       di esse è per definizione la fine di un rapporto: restano fuori dall'indice. */
    'newsletter/confermato' => [
        'pagina'  => 'newsletter-conferma',
        'briciola' => 'Iscrizione confermata',
        'title'   => 'Iscrizione confermata — Simone Pizzi',
        'desc'    => 'La tua iscrizione alla newsletter è confermata.',
        'noindex' => true,
    ],

    'newsletter/disiscritto' => [
        'pagina'  => 'newsletter-disiscrizione',
        'briciola' => 'Disiscrizione',
        'title'   => 'Disiscrizione completata — Simone Pizzi',
        'desc'    => 'Non riceverai più la newsletter.',
        'noindex' => true,
    ],

];
