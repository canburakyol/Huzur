package com.huzurapp.android;

import com.google.firebase.appcheck.AppCheckProviderFactory;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;

public final class AppCheckProviderResolver {
    private AppCheckProviderResolver() {
    }

    public static AppCheckProviderFactory getFactory() {
        return PlayIntegrityAppCheckProviderFactory.getInstance();
    }
}
